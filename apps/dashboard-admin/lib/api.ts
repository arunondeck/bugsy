import { z } from 'zod';
import { env } from '@/lib/env';
import {
  AdminAccount,
  AdminMetrics,
  AdminOperator,
  AdminPlan,
  AdminSession,
  AuditEvent,
  Payout,
  adminAccountSchema,
  adminMetricsSchema,
  adminOperatorSchema,
  adminPlanSchema,
  adminSessionSchema,
  auditEventSchema,
  payoutSchema
} from '@/lib/schemas';
import {
  mockAccounts,
  mockAuditLog,
  mockMetrics,
  mockOperators,
  mockPlans,
  mockPayouts,
  mockSession
} from '@/lib/mock-data';

type WithSchema<TSchema extends z.ZodTypeAny> = { schema: TSchema };

type RequestConfig<TSchema extends z.ZodTypeAny> = WithSchema<TSchema> & {
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

type AdminApi = {
  getSession(): Promise<AdminSession>;
  getMetrics(): Promise<AdminMetrics>;
  listAccounts(): Promise<AdminAccount[]>;
  listPlans(): Promise<AdminPlan[]>;
  listOperators(): Promise<AdminOperator[]>;
  listPayouts(): Promise<Payout[]>;
  listAuditLog(): Promise<AuditEvent[]>;
};

function createHttpApi(): AdminApi {
  return {
    getSession() {
      return request({ path: '/v1/admin/session', schema: adminSessionSchema });
    },
    getMetrics() {
      return request({ path: '/v1/admin/metrics', schema: adminMetricsSchema });
    },
    listAccounts() {
      return request({ path: '/v1/admin/accounts', schema: adminAccountSchema.array() });
    },
    listPlans() {
      return request({ path: '/v1/admin/plans', schema: adminPlanSchema.array() });
    },
    listOperators() {
      return request({ path: '/v1/admin/operators', schema: adminOperatorSchema.array() });
    },
    listPayouts() {
      return request({ path: '/v1/admin/payouts', schema: payoutSchema.array() });
    },
    listAuditLog() {
      return request({ path: '/v1/admin/audit-log', schema: auditEventSchema.array() });
    }
  } satisfies AdminApi;
}

function createMockApi(): AdminApi {
  return {
    getSession: () => simulate(mockSession),
    getMetrics: () => simulate(mockMetrics),
    listAccounts: () => simulate(mockAccounts),
    listPlans: () => simulate(mockPlans),
    listOperators: () => simulate(mockOperators),
    listPayouts: () => simulate(mockPayouts),
    listAuditLog: () => simulate(mockAuditLog)
  } satisfies AdminApi;
}

export const api: AdminApi = env.useMocks ? createMockApi() : createHttpApi();

export type { AdminApi };
