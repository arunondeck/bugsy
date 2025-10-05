import { z } from 'zod';
import type { BillingPort, ClockPort, EmailPort, IdPort, RepoPort } from '@bugsy/ports';
import {
  billingSummarySchema,
  feedbackSchema,
  planSchema,
  projectSchema,
  projectSnippetSchema,
  memberSchema,
  usageSummarySchema
} from '../entities';
import {
  checkoutStartSchema,
  FeedbackUpdateInput,
  feedbackUpdateSchema,
  memberInviteSchema,
  ProjectCreateInput,
  projectCreateSchema,
  ProjectUpdateInput,
  projectUpdateSchema
} from '../dto';

const defaultWidget = {
  theme: 'auto' as const,
  position: 'right' as const,
  captcha: { provider: 'none' as const },
  screenshot: { enabled: true }
};

export type DashboardServiceDeps = {
  repo: Pick<
    RepoPort,
    |
      'listProjects'
      | 'createProject'
      | 'getProjectById'
      | 'updateProject'
      | 'getProjectSnippet'
      | 'getFeedbackById'
      | 'listFeedback'
      | 'updateFeedback'
      | 'listPlans'
      | 'listMembers'
      | 'getUsage'
      | 'getAccount'
  >;
  billing: Pick<BillingPort, 'startCheckout' | 'getBillingSummary'>;
  email: Pick<EmailPort, 'sendMagicLink'>;
  ids: Pick<IdPort, 'next'>;
  clock: Pick<ClockPort, 'now'>;
};

export type DashboardService = ReturnType<typeof createDashboardService>;

export function createDashboardService({ repo, billing, email, ids, clock }: DashboardServiceDeps) {
  return {
    async listProjects(accountId: string) {
      const projects = await repo.listProjects(accountId);
      return projectSchema.array().parse(projects);
    },

    async createProject(accountId: string, dto: ProjectCreateInput) {
      const parsed = projectCreateSchema.parse(dto);
      const createdAt = clock.now();
      const id = ids.next();
      const widgetInput = parsed.widget ?? {};
      const captchaConfig = {
        ...defaultWidget.captcha,
        ...(widgetInput.captcha ?? {})
      } as { provider: 'none' | 'turnstile' | 'hcaptcha'; siteKey?: string };
      const screenshotConfig = {
        ...defaultWidget.screenshot,
        ...(widgetInput.screenshot ?? {})
      } as { enabled: boolean };
      const project = await repo.createProject({
        id,
        accountId,
        name: parsed.name,
        description: parsed.description,
        authorizedDomains: parsed.authorizedDomains,
        widget: {
          theme: widgetInput.theme ?? defaultWidget.theme,
          position: widgetInput.position ?? defaultWidget.position,
          captcha: {
            provider: captchaConfig.provider,
            siteKey: captchaConfig.siteKey
          },
          screenshot: {
            enabled: screenshotConfig.enabled
          }
        },
        publicKey: `pk_${ids.next()}`,
        secretKey: `sk_${ids.next()}`,
        status: 'ACTIVE',
        createdAt,
        submissionsThisWeek: 0
      });

      return projectSchema.parse(project);
    },

    async getProject(projectId: string) {
      const project = await repo.getProjectById(projectId);
      return project ? projectSchema.parse(project) : null;
    },

    async updateProject(projectId: string, patch: ProjectUpdateInput) {
      const parsed = projectUpdateSchema.parse(patch);
      const existing = await repo.getProjectById(projectId);
      if (!existing) {
        return null;
      }

      const widget = parsed.widget
        ? {
            theme: parsed.widget.theme ?? existing.widget.theme,
            position: parsed.widget.position ?? existing.widget.position,
            captcha: {
              ...existing.widget.captcha,
              ...(parsed.widget.captcha ?? {})
            },
            screenshot: {
              ...existing.widget.screenshot,
              ...(parsed.widget.screenshot ?? {})
            }
          }
        : existing.widget;

      const updated = await repo.updateProject(projectId, {
        ...parsed,
        widget
      });

      return updated ? projectSchema.parse(updated) : null;
    },

    async rotateProjectSecret(projectId: string) {
      const project = await repo.getProjectById(projectId);
      if (!project) {
        return null;
      }

      const secretKey = `sk_${ids.next()}`;
      const updated = await repo.updateProject(projectId, { secretKey });
      return updated ? projectSchema.parse(updated) : null;
    },

    async getProjectSnippet(projectId: string) {
      const snippet = await repo.getProjectSnippet(projectId);
      if (snippet) {
        return projectSnippetSchema.parse(snippet);
      }

      const project = await repo.getProjectById(projectId);
      if (!project) {
        return null;
      }

      const embedSnippet = `<script>window.FBW_INIT={projectKey:'${project.publicKey}',theme:'${project.widget.theme}',position:'${project.widget.position}'};</script><script async src='https://cdn.example.com/embed.js'></script>`;
      return projectSnippetSchema.parse({ projectId, embedSnippet });
    },

    async listFeedback(projectId: string, filters?: Record<string, unknown>) {
      const result = await repo.listFeedback(projectId, filters);
      return feedbackSchema.array().parse(result);
    },

    async getFeedback(feedbackId: string) {
      const feedback = await repo.getFeedbackById(feedbackId);
      return feedback ? feedbackSchema.parse(feedback) : null;
    },

    async updateFeedback(feedbackId: string, dto: FeedbackUpdateInput) {
      const parsed = feedbackUpdateSchema.parse(dto);
      const updated = await repo.updateFeedback(feedbackId, parsed);
      return updated ? feedbackSchema.parse(updated) : null;
    },

    async listMembers(accountId: string) {
      const members = await repo.listMembers(accountId);
      const normalized = members.map((member) => ({
        id: member.id,
        email: member.email,
        name: member.name,
        role: (member.roles[0] ?? 'VIEWER') as z.infer<typeof memberSchema>['role']
      }));
      return memberSchema.array().parse(normalized);
    },

    async inviteMember(accountId: string, dto: { email: string; role: 'OWNER' | 'ADMIN' | 'VIEWER' }) {
      const parsed = memberInviteSchema.parse(dto);
      const loginLink = `https://app.example.com/login?email=${encodeURIComponent(parsed.email)}`;
      await email.sendMagicLink(parsed.email, loginLink);
      return { accountId, email: parsed.email, role: parsed.role };
    },

    async listPlans() {
      const plans = await repo.listPlans(true);
      return planSchema.array().parse(plans);
    },

    async getBillingSummary(accountId: string) {
      const summary = await billing.getBillingSummary(accountId);
      return billingSummarySchema.parse(summary);
    },

    async startCheckout(accountId: string, dto: { planId: string }) {
      const parsed = checkoutStartSchema.parse(dto);
      return billing.startCheckout(accountId, parsed.planId);
    },

    async getUsageSummary(accountId: string) {
      const now = new Date(clock.now());
      const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
      const usage = await repo.getUsage(accountId, period);
      const account = await repo.getAccount(accountId);
      const plans = await repo.listPlans(false);
      const activePlan = account ? plans.find((plan) => plan.id === account.planId) : undefined;
      const quota = activePlan?.limits ?? { submissions: 0, attachmentsMB: 0, projects: 0, seats: 0 };

      if (!usage) {
        return usageSummarySchema.parse({
          period,
          submissions: 0,
          attachmentsMB: 0,
          projects: 0,
          seats: 0,
          quota
        });
      }

      return usageSummarySchema.parse({
        period,
        submissions: usage.submissions,
        attachmentsMB: usage.attachmentsMB,
        projects: usage.projects,
        seats: usage.seats,
        quota
      });
    }
  };
}
