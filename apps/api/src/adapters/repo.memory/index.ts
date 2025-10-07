import { randomUUID } from 'node:crypto';

import type { Feedback, Project } from '../../domain/entities';
import type { Account, AccountUsagePatch, Plan, PlanInput, RepoPort, User } from '../../ports';

interface MemoryState {
  accounts: Account[];
  users: User[];
  projects: Project[];
  feedback: Feedback[];
  plans: Plan[];
  usage: Map<string, AccountUsagePatch>;
}

const defaultState = (): MemoryState => ({
  accounts: [],
  users: [],
  projects: [],
  feedback: [],
  plans: [],
  usage: new Map()
});

export class InMemoryRepoAdapter implements RepoPort {
  private state: MemoryState;

  constructor(seed?: Partial<MemoryState>) {
    this.state = { ...defaultState(), ...seed };
  }

  async getAccount(id: string): Promise<Account | null> {
    return this.state.accounts.find((account) => account.id === id) ?? null;
  }

  async getAccountByUser(userId: string): Promise<Account | null> {
    const user = this.state.users.find((item) => item.id === userId);
    if (!user) {
      return null;
    }
    return this.getAccount(user.accountId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.state.users.find((user) => user.email === email) ?? null;
  }

  async createUser(user: Partial<User> & { email: string; accountId: string }): Promise<User> {
    const created: User = {
      id: user.id ?? randomUUID(),
      email: user.email,
      accountId: user.accountId,
      name: user.name ?? null,
      roles: user.roles ?? ['ADMIN'],
      createdAt: user.createdAt ?? new Date()
    };
    this.state.users.push(created);
    return created;
  }

  async listMembers(accountId: string): Promise<User[]> {
    return this.state.users.filter((user) => user.accountId === accountId);
  }

  async createProject(input: Partial<Project> & { accountId: string; name: string }): Promise<Project> {
    const project: Project = {
      id: input.id ?? randomUUID(),
      accountId: input.accountId,
      name: input.name,
      description: input.description ?? null,
      publicKey: input.publicKey ?? `pk_${randomUUID().slice(-8)}`,
      secretKey: input.secretKey ?? `sk_${randomUUID().slice(-12)}`,
      authorizedDomains: input.authorizedDomains ?? [],
      widget: input.widget ?? { theme: 'auto' },
      status: (input.status as Project['status']) ?? 'ACTIVE',
      createdAt: input.createdAt ?? new Date()
    };
    this.state.projects.push(project);
    return project;
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
    const project = this.state.projects.find((item) => item.id === id);
    if (!project) {
      return null;
    }
    Object.assign(project, patch);
    return project;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.state.projects.find((project) => project.id === id) ?? null;
  }

  async getProjectByPublicKey(pk: string): Promise<Project | null> {
    return this.state.projects.find((project) => project.publicKey === pk) ?? null;
  }

  async createFeedback(
    input: Partial<Feedback> & { projectId: string; title: string }
  ): Promise<Feedback> {
    const feedback: Feedback = {
      id: input.id ?? randomUUID(),
      projectId: input.projectId,
      title: input.title,
      body: input.body ?? null,
      status: (input.status as Feedback['status']) ?? 'NEW',
      authorEmail: input.authorEmail ?? null,
      tags: input.tags ?? [],
      context: input.context ?? {},
      attachments: input.attachments ?? [],
      voteCount: input.voteCount ?? 0,
      createdAt: input.createdAt ?? new Date()
    };
    this.state.feedback.push(feedback);
    return feedback;
  }

  async listFeedback(projectId: string): Promise<Feedback[]> {
    return this.state.feedback.filter((item) => item.projectId === projectId);
  }

  async getFeedback(id: string): Promise<Feedback | null> {
    return this.state.feedback.find((item) => item.id === id) ?? null;
  }

  async updateFeedback(id: string, patch: Partial<Feedback>): Promise<Feedback | null> {
    const feedback = this.state.feedback.find((item) => item.id === id);
    if (!feedback) {
      return null;
    }
    Object.assign(feedback, patch);
    return feedback;
  }

  async incrementUsage(accountId: string, patch: AccountUsagePatch): Promise<void> {
    const key = `${accountId}:${new Date().toISOString().slice(0, 7)}`;
    const current = this.state.usage.get(key) ?? {};
    const next: AccountUsagePatch = {
      submissions: (current.submissions ?? 0) + (patch.submissions ?? 0),
      attachmentsMB: (current.attachmentsMB ?? 0) + (patch.attachmentsMB ?? 0),
      projects: (current.projects ?? 0) + (patch.projects ?? 0),
      seats: (current.seats ?? 0) + (patch.seats ?? 0)
    };
    this.state.usage.set(key, next);
  }

  async getUsage(accountId: string, period: string): Promise<AccountUsagePatch | null> {
    return this.state.usage.get(`${accountId}:${period}`) ?? null;
  }

  async listPlans(publishedOnly: boolean): Promise<Plan[]> {
    return publishedOnly ? this.state.plans.filter((plan) => plan.published) : this.state.plans;
  }

  async createPlan(dto: PlanInput): Promise<Plan> {
    const plan: Plan = {
      id: randomUUID(),
      name: dto.name,
      priceUsd: dto.priceUsd,
      trialDays: dto.trialDays,
      limits: dto.limits,
      features: dto.features,
      published: dto.published
    };
    this.state.plans.push(plan);
    return plan;
  }

  async updatePlan(id: string, patch: Partial<PlanInput>): Promise<Plan | null> {
    const plan = this.state.plans.find((item) => item.id === id);
    if (!plan) {
      return null;
    }
    Object.assign(plan, patch);
    return plan;
  }
}
