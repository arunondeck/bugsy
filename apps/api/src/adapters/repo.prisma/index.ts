import { PrismaClient } from '@prisma/client';

import type { Feedback, Project } from '../../domain/entities';
import type {
  Account,
  AccountUsagePatch,
  Plan,
  PlanInput,
  RepoPort,
  User
} from '../../ports';

export class PrismaRepoAdapter implements RepoPort {
  constructor(private readonly prisma: PrismaClient) {}

  getAccount(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({ where: { id } }) as unknown as Promise<Account | null>;
  }

  async getAccountByUser(userId: string): Promise<Account | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }
    return this.getAccount(user.accountId);
  }

  getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } }) as unknown as Promise<User | null>;
  }

  async createUser(user: Partial<User> & { email: string; accountId: string }): Promise<User> {
    return (await this.prisma.user.create({
      data: {
        email: user.email,
        accountId: user.accountId,
        name: user.name ?? null,
        roles: user.roles ?? [],
        createdAt: user.createdAt ?? new Date()
      }
    })) as unknown as User;
  }

  listMembers(accountId: string): Promise<User[]> {
    return this.prisma.user.findMany({ where: { accountId } }) as unknown as Promise<User[]>;
  }

  createProject(input: Partial<Project> & { accountId: string; name: string }): Promise<Project> {
    return this.prisma.project.create({
      data: {
        accountId: input.accountId,
        name: input.name,
        description: input.description ?? null,
        publicKey: input.publicKey!,
        secretKey: input.secretKey!,
        authorizedDomains: input.authorizedDomains ?? [],
        widget: input.widget ?? {},
        status: input.status ?? 'ACTIVE'
      }
    }) as unknown as Promise<Project>;
  }

  updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
    return this.prisma.project
      .update({ where: { id }, data: patch })
      .then((project) => project as unknown as Project)
      .catch(() => null);
  }

  getProjectById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { id } }) as unknown as Promise<Project | null>;
  }

  getProjectByPublicKey(pk: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { publicKey: pk } }) as unknown as Promise<Project | null>;
  }

  createFeedback(input: Partial<Feedback> & { projectId: string; title: string }): Promise<Feedback> {
    return this.prisma.feedback.create({
      data: {
        projectId: input.projectId,
        title: input.title,
        body: input.body ?? null,
        status: input.status ?? 'NEW',
        authorEmail: input.authorEmail ?? null,
        tags: input.tags ?? [],
        context: input.context ?? {},
        attachments: input.attachments ?? [],
        voteCount: input.voteCount ?? 0
      }
    }) as unknown as Promise<Feedback>;
  }

  listFeedback(projectId: string): Promise<Feedback[]> {
    return this.prisma.feedback.findMany({ where: { projectId } }) as unknown as Promise<Feedback[]>;
  }

  getFeedback(id: string): Promise<Feedback | null> {
    return this.prisma.feedback.findUnique({ where: { id } }) as unknown as Promise<Feedback | null>;
  }

  updateFeedback(id: string, patch: Partial<Feedback>): Promise<Feedback | null> {
    return this.prisma.feedback
      .update({ where: { id }, data: patch })
      .then((feedback) => feedback as unknown as Feedback)
      .catch(() => null);
  }

  async incrementUsage(accountId: string, patch: AccountUsagePatch): Promise<void> {
    const period = new Date().toISOString().slice(0, 7);
    await this.prisma.usageCounter.upsert({
      where: { accountId_period: { accountId, period } },
      update: {
        submissions: { increment: patch.submissions ?? 0 },
        attachmentsMB: { increment: patch.attachmentsMB ?? 0 },
        projects: { increment: patch.projects ?? 0 },
        seats: { increment: patch.seats ?? 0 }
      },
      create: {
        accountId,
        period,
        submissions: patch.submissions ?? 0,
        attachmentsMB: patch.attachmentsMB ?? 0,
        projects: patch.projects ?? 0,
        seats: patch.seats ?? 0
      }
    });
  }

  getUsage(accountId: string, period: string): Promise<AccountUsagePatch | null> {
    return this.prisma.usageCounter.findUnique({
      where: { accountId_period: { accountId, period } }
    }) as unknown as Promise<AccountUsagePatch | null>;
  }

  listPlans(publishedOnly: boolean): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      where: publishedOnly ? { published: true } : undefined
    }) as unknown as Promise<Plan[]>;
  }

  createPlan(dto: PlanInput): Promise<Plan> {
    return this.prisma.plan.create({ data: dto }) as unknown as Promise<Plan>;
  }

  updatePlan(id: string, patch: Partial<PlanInput>): Promise<Plan | null> {
    return this.prisma.plan
      .update({ where: { id }, data: patch })
      .then((plan) => plan as unknown as Plan)
      .catch(() => null);
  }
}
