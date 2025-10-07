import { hashIp } from '../../lib/crypto';
import type {
  BillingPort,
  EmailPort,
  Ports,
  RepoPort,
  StoragePort
} from '../../ports';
import type { Feedback, Project } from '../entities';
import { DomainError, NotFoundError, ValidationError } from '../errors';

export type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const err = (error: DomainError): Result<never> => ({ ok: false, error });

export const submitFeedback = async (
  ports: Ports,
  input: {
    projectId: string;
    title: string;
    body?: string;
    authorEmail?: string;
    context: Record<string, unknown>;
    attachments?: Array<Record<string, unknown>>;
    captcha?: { provider: 'turnstile' | 'hcaptcha'; token: string };
    ipAddress?: string;
  }
): Promise<Result<{ id: string; status: Feedback['status'] }>> => {
  const project = await ports.repo.getProjectById(input.projectId);
  if (!project) {
    return err(new NotFoundError('Project not found'));
  }

  if (input.captcha) {
    const ipHash = hashIp(input.ipAddress ?? '');
    const captchaOk = await ports.captcha.verify(
      input.captcha.provider,
      input.captcha.token,
      ipHash
    );
    if (!captchaOk) {
      return err(new ValidationError('Captcha validation failed'));
    }
  }

  const created = await ports.repo.createFeedback({
    projectId: project.id,
    title: input.title,
    body: input.body,
    authorEmail: input.authorEmail,
    context: input.context,
    attachments: input.attachments ?? [],
    status: 'NEW',
    tags: [],
    voteCount: 0,
    createdAt: ports.clock.now()
  });

  await ports.repo.incrementUsage(project.accountId, { submissions: 1 });

  return ok({ id: created.id, status: created.status });
};

export const createProject = async (
  repo: RepoPort,
  idPort: Ports['id'],
  accountId: string,
  dto: {
    name: string;
    description?: string;
    widget: Record<string, unknown>;
    authorizedDomains: string[];
  }
): Promise<Result<Project>> => {
  const idValue = await Promise.resolve(idPort.next());
  const project = await repo.createProject({
    id: typeof idValue === 'string' ? idValue : await Promise.resolve(idValue),
    accountId,
    name: dto.name,
    description: dto.description,
    widget: dto.widget,
    authorizedDomains: dto.authorizedDomains,
    publicKey: `pk_${Math.random().toString(36).slice(-8)}`,
    secretKey: `sk_${Math.random().toString(36).slice(-12)}`,
    status: 'ACTIVE',
    createdAt: new Date()
  });
  return ok(project);
};

export const updateProject = async (
  repo: RepoPort,
  projectId: string,
  dto: Partial<Project>
): Promise<Result<Project>> => {
  const updated = await repo.updateProject(projectId, dto);
  if (!updated) {
    return err(new NotFoundError('Project not found'));
  }
  return ok(updated);
};

export const rotateProjectSecret = async (
  repo: RepoPort,
  projectId: string
): Promise<Result<{ secretKey: string }>> => {
  const secretKey = `sk_${Math.random().toString(36).slice(-12)}`;
  const updated = await repo.updateProject(projectId, { secretKey });
  if (!updated) {
    return err(new NotFoundError('Project not found'));
  }
  return ok({ secretKey });
};

export const listFeedback = async (
  repo: RepoPort,
  projectId: string,
  filters?: Record<string, unknown>
): Promise<Result<Feedback[]>> => {
  const project = await repo.getProjectById(projectId);
  if (!project) {
    return err(new NotFoundError('Project not found'));
  }
  const feedback = await repo.listFeedback(projectId, filters);
  return ok(feedback);
};

export const updateFeedback = async (
  repo: RepoPort,
  feedbackId: string,
  dto: Partial<Feedback>
): Promise<Result<Feedback>> => {
  const updated = await repo.updateFeedback(feedbackId, dto);
  if (!updated) {
    return err(new NotFoundError('Feedback not found'));
  }
  return ok(updated);
};

export const getUsageSummary = async (
  repo: RepoPort,
  accountId: string
): Promise<Result<Record<string, unknown>>> => {
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const usage = await repo.getUsage(accountId, currentPeriod);
  return ok(usage ?? {});
};

export const inviteMember = async (
  repo: RepoPort,
  emailPort: EmailPort,
  accountId: string,
  targetEmail: string,
  role: string
): Promise<Result<void>> => {
  await repo.createUser({
    email: targetEmail,
    accountId,
    roles: [role],
    createdAt: new Date(),
    id: Math.random().toString(36).slice(2)
  } as any);
  await emailPort.send(targetEmail, 'You have been invited to Bugsy', `Join account ${accountId}`);
  return ok(undefined);
};

export const startCheckout = async (
  billing: BillingPort,
  accountId: string,
  planId: string
): Promise<Result<{ checkoutUrl: string }>> => {
  const checkout = await billing.startCheckout(accountId, planId);
  return ok(checkout);
};

export const getBillingSummary = async (
  billing: BillingPort,
  accountId: string
): Promise<Result<Record<string, unknown>>> => ok(await billing.getBillingSummary(accountId));

export const adminCreatePlan = async (
  repo: RepoPort,
  dto: {
    name: string;
    priceUsd: number;
    trialDays: number;
    limits: Record<string, unknown>;
    features: Record<string, unknown>;
    published: boolean;
  }
): Promise<Result<Awaited<ReturnType<RepoPort['createPlan']>>>> => {
  const plan = await repo.createPlan({
    name: dto.name,
    priceUsd: dto.priceUsd,
    trialDays: dto.trialDays,
    limits: dto.limits,
    features: dto.features,
    published: dto.published
  });
  return ok(plan);
};

export const adminUpdatePlan = async (
  repo: RepoPort,
  id: string,
  patch: Partial<{
    name: string;
    priceUsd: number;
    trialDays: number;
    limits: Record<string, unknown>;
    features: Record<string, unknown>;
    published: boolean;
  }>
): Promise<Result<Awaited<ReturnType<RepoPort['updatePlan']>>>> => {
  const plan = await repo.updatePlan(id, patch);
  if (!plan) {
    return err(new NotFoundError('Plan not found'));
  }
  return ok(plan);
};

export const buildUploadUrl = async (
  storage: StoragePort,
  contentType: string
): Promise<Result<{ url: string; publicUrl: string }>> => ok(await storage.presign('image', contentType));
