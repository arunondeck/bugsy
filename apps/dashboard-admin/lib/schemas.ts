import { planSchema } from '@bugsy/domain';
import { z } from 'zod';

export const adminPermissionSchema = z.enum(['SUPERADMIN', 'SUPPORT', 'FINANCE']);

export type AdminPermission = z.infer<typeof adminPermissionSchema>;

export const adminSessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  permissions: z.array(adminPermissionSchema).min(1)
});

export type AdminSession = z.infer<typeof adminSessionSchema>;

export const adminMetricsSchema = z.object({
  mrrUsd: z.number(),
  arrUsd: z.number(),
  activeAccounts: z.number(),
  churnRate: z.number(),
  ticketsOpen: z.number(),
  inboxBacklog: z.number(),
  lastSyncAt: z.number()
});

export type AdminMetrics = z.infer<typeof adminMetricsSchema>;

export const adminAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  planId: z.string(),
  planName: z.string(),
  status: z.enum(['ACTIVE', 'PAST_DUE', 'TRIALING', 'CANCELED']),
  seats: z.number(),
  mrrUsd: z.number(),
  arrearsUsd: z.number(),
  lastInvoiceAt: z.number(),
  createdAt: z.number()
});

export type AdminAccount = z.infer<typeof adminAccountSchema>;

export const adminOperatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  account: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'VIEWER']),
  lastSeenAt: z.number(),
  createdAt: z.number()
});

export type AdminOperator = z.infer<typeof adminOperatorSchema>;

export const adminPlanSchema = planSchema.extend({
  activeSubscribers: z.number(),
  hidden: z.boolean().default(false)
});

export type AdminPlan = z.infer<typeof adminPlanSchema>;

export const payoutSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'paid', 'failed']),
  amountUsd: z.number(),
  initiatedAt: z.number(),
  depositedAt: z.number().optional()
});

export type Payout = z.infer<typeof payoutSchema>;

export const auditEventSchema = z.object({
  id: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string(),
  createdAt: z.number(),
  severity: z.enum(['low', 'medium', 'high'])
});

export type AuditEvent = z.infer<typeof auditEventSchema>;
