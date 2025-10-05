import { z } from 'zod';
import { env } from '@/lib/env';
import {
  DashboardSession,
  billingSummarySchema,
  createDashboardService,
  dashboardSessionSchema,
  feedbackSchema,
  memberSchema,
  planSchema,
  projectSchema,
  projectSnippetSchema,
  usageSummarySchema
} from '@/lib/domain';
import { createDemoMemoryRepo, demoBillingSummary } from '@bugsy/repo-memory';

type WithSchema<T extends z.ZodTypeAny> = {
  schema: T;
};

type RequestConfig<T extends z.ZodTypeAny> = WithSchema<T> & {
  path: string;
  init?: RequestInit;
};

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<TSchema extends z.ZodTypeAny>({
  path,
  schema,
  init
}: RequestConfig<TSchema>): Promise<z.infer<TSchema>> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });

  if (!response.ok) {
    const message = `Request to ${path} failed with ${response.status}`;
    throw new ApiError(message, response.status);
  }

  const data = await response.json();
  return schema.parse(data);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulate<T>(value: T, ms = 150): Promise<T> {
  await delay(ms);
  return value;
}

type DashboardApi = {
  getSession(): Promise<DashboardSession>;
  listProjects(): Promise<z.infer<typeof projectSchema>[]>;
  getProject(id: string): Promise<z.infer<typeof projectSchema> | null>;
  getProjectSnippet(id: string): Promise<z.infer<typeof projectSnippetSchema>>;
  listFeedback(projectId?: string): Promise<z.infer<typeof feedbackSchema>[]>;
  getFeedback(id: string): Promise<z.infer<typeof feedbackSchema> | null>;
  getUsageSummary(): Promise<z.infer<typeof usageSummarySchema>>;
  listMembers(): Promise<z.infer<typeof memberSchema>[]>;
  listPlans(): Promise<z.infer<typeof planSchema>[]>;
  getBillingSummary(): Promise<z.infer<typeof billingSummarySchema>>;
};

function createHttpApi(): DashboardApi {
  return {
    getSession() {
      return request({ path: '/v1/session', schema: dashboardSessionSchema });
    },
    listProjects() {
      return request({ path: '/v1/projects', schema: projectSchema.array() });
    },
    getProject(id: string) {
      return request({ path: `/v1/projects/${id}`, schema: projectSchema }).catch((error) => {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      });
    },
    getProjectSnippet(id: string) {
      return request({ path: `/v1/projects/${id}/snippet`, schema: projectSnippetSchema });
    },
    listFeedback(projectId) {
      const searchParams = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      return request({ path: `/v1/feedback${searchParams}`, schema: feedbackSchema.array() });
    },
    getFeedback(id: string) {
      return request({ path: `/v1/feedback/${id}`, schema: feedbackSchema }).catch((error) => {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      });
    },
    getUsageSummary() {
      return request({ path: '/v1/usage/summary', schema: usageSummarySchema });
    },
    listMembers() {
      return request({ path: '/v1/members', schema: memberSchema.array() });
    },
    listPlans() {
      return request({ path: '/v1/plans/public', schema: planSchema.array() });
    },
    getBillingSummary() {
      return request({ path: '/v1/billing/summary', schema: billingSummarySchema });
    }
  } satisfies DashboardApi;
}

function createMockApi(): DashboardApi {
  const session: DashboardSession = {
    userId: 'user_1',
    accountId: 'acct_123',
    email: 'owner@example.com',
    name: 'Demo Owner',
    roles: ['OWNER', 'ADMIN']
  };

  let counter = 0;
  const repo = createDemoMemoryRepo();
  const service = createDashboardService({
    repo,
    billing: {
      async startCheckout(accountId: string, planId: string) {
        return { checkoutUrl: `https://billing.example.com/checkout?account=${accountId}&plan=${planId}` };
      },
      async getBillingSummary(_accountId: string) {
        return demoBillingSummary;
      }
    },
    email: {
      async sendMagicLink() {
        return;
      }
    },
    ids: {
      next() {
        counter += 1;
        return `mock_${counter}`;
      }
    },
    clock: {
      now() {
        return Date.now();
      }
    }
  });

  return {
    getSession: () => simulate(session),
    listProjects: () => service.listProjects(session.accountId),
    getProject: (id: string) => service.getProject(id),
    getProjectSnippet: async (id: string) => {
      const snippet = await service.getProjectSnippet(id);
      if (snippet) {
        return snippet;
      }
      return {
        projectId: id,
        embedSnippet:
          "<script>window.FBW_INIT={projectKey:'pk_placeholder',theme:'auto',position:'right'};</script>\n" +
          "<script async src='https://cdn.example.com/embed.js'></script>"
      };
    },
    listFeedback: async (projectId?: string) => {
      if (projectId) {
        return service.listFeedback(projectId);
      }
      const projects = await service.listProjects(session.accountId);
      const all = await Promise.all(projects.map((project) => service.listFeedback(project.id)));
      return all.flat();
    },
    getFeedback: (id: string) => service.getFeedback(id),
    getUsageSummary: () => service.getUsageSummary(session.accountId),
    listMembers: () => service.listMembers(session.accountId),
    listPlans: () => service.listPlans(),
    getBillingSummary: () => service.getBillingSummary(session.accountId)
  } satisfies DashboardApi;
}

export const api: DashboardApi = env.useMocks ? createMockApi() : createHttpApi();

export type { DashboardApi };
