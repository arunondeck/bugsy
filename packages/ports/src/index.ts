import type {
  Account,
  BillingSummary,
  Feedback,
  Plan,
  Project,
  ProjectSnippet,
  UsageCounter,
  User
} from '@bugsy/domain';

export interface RepoPort {
  getAccount(id: string): Promise<Account | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  listMembers(accountId: string): Promise<User[]>;
  listProjects(accountId: string): Promise<Project[]>;
  createProject(project: Project): Promise<Project>;
  getProjectById(id: string): Promise<Project | null>;
  getProjectByPublicKey(pk: string): Promise<Project | null>;
  updateProject(id: string, patch: Partial<Project>): Promise<Project | null>;
  createFeedback(feedback: Feedback): Promise<Feedback>;
  getFeedbackById(id: string): Promise<Feedback | null>;
  listFeedback(projectId: string, filters?: Record<string, unknown>): Promise<Feedback[]>;
  updateFeedback(id: string, patch: Partial<Feedback>): Promise<Feedback | null>;
  incrementUsage(accountId: string, countersPatch: Partial<UsageCounter>): Promise<void>;
  getUsage(accountId: string, period: string): Promise<UsageCounter | null>;
  listPlans(publishedOnly: boolean): Promise<Plan[]>;
  createPlan(plan: Plan): Promise<Plan>;
  updatePlan(id: string, patch: Partial<Plan>): Promise<Plan | null>;
  getProjectSnippet(id: string): Promise<ProjectSnippet | null>;
}

export interface ConfigPort {
  get(): {
    appBaseUrl: string;
    widgetCdnUrl: string;
  } & Record<string, string>;
}

export interface EmailPort {
  send(to: string, subject: string, text: string): Promise<void>;
  sendMagicLink(email: string, link: string): Promise<void>;
}

export interface BillingPort {
  startCheckout(accountId: string, planId: string): Promise<{ checkoutUrl: string }>;
  getBillingSummary(accountId: string): Promise<BillingSummary>;
  openCustomerPortal(accountId: string): Promise<{ url: string }>;
}

export interface CaptchaPort {
  verify(provider: 'turnstile' | 'hcaptcha', token: string, remoteIpHash: string): Promise<boolean>;
}

export interface StoragePort {
  presign(kind: 'image', contentType: string): Promise<{ url: string; publicUrl: string }>;
}

export interface RateLimitPort {
  check(key: string, limit: number, windowSec: number): Promise<boolean>;
}

export interface AuthPort {
  issueMagicToken(email: string): Promise<void>;
  verifyMagicToken(token: string): Promise<{ userId: string; accountId: string }>;
}

export interface IdPort {
  next(): string;
}

export interface ClockPort {
  now(): number;
}
