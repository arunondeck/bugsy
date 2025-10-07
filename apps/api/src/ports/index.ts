import type { Feedback, Project } from '../domain/entities';

export interface AccountUsagePatch {
  submissions?: number;
  attachmentsMB?: number;
  projects?: number;
  seats?: number;
}

export interface RepoPort {
  getAccount(id: string): Promise<Account | null>;
  getAccountByUser(userId: string): Promise<Account | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Partial<User> & { email: string; accountId: string }): Promise<User>;
  listMembers(accountId: string): Promise<User[]>;
  createProject(input: Partial<Project> & { accountId: string; name: string }): Promise<Project>;
  updateProject(id: string, patch: Partial<Project>): Promise<Project | null>;
  getProjectById(id: string): Promise<Project | null>;
  getProjectByPublicKey(pk: string): Promise<Project | null>;
  createFeedback(input: Partial<Feedback> & { projectId: string; title: string }): Promise<Feedback>;
  listFeedback(projectId: string, filters?: Record<string, unknown>): Promise<Feedback[]>;
  getFeedback(id: string): Promise<Feedback | null>;
  updateFeedback(id: string, patch: Partial<Feedback>): Promise<Feedback | null>;
  incrementUsage(accountId: string, patch: AccountUsagePatch): Promise<void>;
  getUsage(accountId: string, period: string): Promise<AccountUsagePatch | null>;
  listPlans(publishedOnly: boolean): Promise<Plan[]>;
  createPlan(dto: PlanInput): Promise<Plan>;
  updatePlan(id: string, patch: Partial<PlanInput>): Promise<Plan | null>;
}

export interface ConfigPort {
  get(): Promise<Record<string, string>>;
}

export interface EmailPort {
  send(to: string, subject: string, text: string): Promise<void>;
  sendMagicLink(email: string, link: string): Promise<void>;
}

export interface BillingPort {
  startCheckout(accountId: string, planId: string): Promise<{ checkoutUrl: string }>;
  getBillingSummary(accountId: string): Promise<Record<string, unknown>>;
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
  verifyMagicToken(token: string): Promise<{ userId: string; accountId: string } | null>;
}

export interface IdPort {
  next(): Promise<string> | string;
}

export interface ClockPort {
  now(): Date;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
  accountId: string;
  createdAt: Date;
}

export interface Account {
  id: string;
  name: string;
  planId: string;
  createdAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  priceUsd: number;
  trialDays: number;
  limits: Record<string, unknown>;
  features: Record<string, unknown>;
  published: boolean;
}

export interface PlanInput {
  name: string;
  priceUsd: number;
  trialDays: number;
  limits: Record<string, unknown>;
  features: Record<string, unknown>;
  published: boolean;
}

export type Ports = {
  repo: RepoPort;
  email: EmailPort;
  billing: BillingPort;
  captcha: CaptchaPort;
  storage: StoragePort;
  rateLimit: RateLimitPort;
  auth: AuthPort;
  id: IdPort;
  clock: ClockPort;
};
