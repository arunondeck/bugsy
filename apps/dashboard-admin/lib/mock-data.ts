import { subDays } from 'date-fns';
import {
  adminAccountSchema,
  adminMetricsSchema,
  adminOperatorSchema,
  adminPlanSchema,
  adminSessionSchema,
  auditEventSchema,
  payoutSchema
} from '@/lib/schemas';
import {
  demoAccount,
  demoPlans,
  demoUsers,
  demoBillingSummary
} from '@bugsy/repo-memory';

const now = new Date();
const planLookup = new Map(demoPlans.map((plan) => [plan.id, plan.name]));

export const mockSession = adminSessionSchema.parse({
  userId: 'operator_1',
  email: 'ops@bugsy.app',
  name: 'Quinn Operator',
  permissions: ['SUPERADMIN', 'FINANCE', 'SUPPORT']
});

export const mockAccounts = adminAccountSchema.array().parse([
  {
    id: demoAccount.id,
    name: demoAccount.name,
    planId: demoAccount.planId,
    planName: planLookup.get(demoAccount.planId) ?? 'Growth',
    status: 'ACTIVE',
    seats: 11,
    mrrUsd: 249,
    arrearsUsd: 0,
    lastInvoiceAt: subDays(now, 5).getTime(),
    createdAt: demoAccount.createdAt
  },
  {
    id: 'acct_456',
    name: 'Northwind Insights',
    planId: 'scale',
    planName: planLookup.get('scale') ?? 'Scale',
    status: 'PAST_DUE',
    seats: 18,
    mrrUsd: 399,
    arrearsUsd: 598,
    lastInvoiceAt: subDays(now, 12).getTime(),
    createdAt: subDays(now, 240).getTime()
  },
  {
    id: 'acct_789',
    name: 'Lumen Analytics',
    planId: 'starter',
    planName: planLookup.get('starter') ?? 'Starter',
    status: 'TRIALING',
    seats: 4,
    mrrUsd: 79,
    arrearsUsd: 0,
    lastInvoiceAt: subDays(now, 2).getTime(),
    createdAt: subDays(now, 21).getTime()
  },
  {
    id: 'acct_901',
    name: 'Orbit Studios',
    planId: 'growth',
    planName: planLookup.get('growth') ?? 'Growth',
    status: 'CANCELED',
    seats: 6,
    mrrUsd: 0,
    arrearsUsd: 0,
    lastInvoiceAt: subDays(now, 47).getTime(),
    createdAt: subDays(now, 420).getTime()
  }
]);

export const mockMetrics = adminMetricsSchema.parse({
  mrrUsd: mockAccounts.reduce((total, account) => total + account.mrrUsd, 0),
  arrUsd: mockAccounts.reduce((total, account) => total + account.mrrUsd * 12, 0),
  activeAccounts: mockAccounts.filter((account) => account.status !== 'CANCELED').length,
  churnRate: 2.3,
  ticketsOpen: 8,
  inboxBacklog: 3,
  lastSyncAt: now.getTime()
});

const operatorLastSeenDays = [2, 7, 11];

export const mockOperators = adminOperatorSchema.array().parse([
  ...demoUsers.map((user, index) => ({
    id: `user_${user.id}`,
    name: user.name ?? 'Workspace User',
    email: user.email,
    account: mockAccounts.find((account) => account.id === user.accountId)?.name ?? 'Acme Co',
    role: user.roles[0] ?? 'VIEWER',
    lastSeenAt: subDays(now, operatorLastSeenDays[index] ?? 3).getTime(),
    createdAt: user.createdAt
  })),
  {
    id: 'user_support',
    name: 'Sasha Support',
    email: 'sasha@bugsy.app',
    account: 'Bugsy Internal',
    role: 'ADMIN',
    lastSeenAt: subDays(now, 1).getTime(),
    createdAt: subDays(now, 90).getTime()
  }
]);

export const mockPlans = adminPlanSchema.array().parse(
  demoPlans.map((plan, index) => ({
    ...plan,
    activeSubscribers: [32, 64, 21][index] ?? 0,
    hidden: plan.id === 'scale' ? false : plan.id === 'starter' ? false : false
  }))
);

export const mockPayouts = payoutSchema.array().parse([
  {
    id: 'po_2024_06_01',
    status: 'paid',
    amountUsd: 12840,
    initiatedAt: subDays(now, 7).getTime(),
    depositedAt: subDays(now, 6).getTime()
  },
  {
    id: 'po_2024_06_08',
    status: 'pending',
    amountUsd: 8450,
    initiatedAt: subDays(now, 1).getTime()
  },
  {
    id: 'po_2024_05_25',
    status: 'failed',
    amountUsd: 9200,
    initiatedAt: subDays(now, 18).getTime()
  }
]);

export const mockAuditLog = auditEventSchema.array().parse([
  {
    id: 'audit_1',
    actor: mockSession.name,
    action: 'Updated plan pricing',
    target: 'Plan growth',
    createdAt: subDays(now, 0.5).getTime(),
    severity: 'medium'
  },
  {
    id: 'audit_2',
    actor: 'Sasha Support',
    action: 'Issued credit memo',
    target: demoAccount.name,
    createdAt: subDays(now, 2).getTime(),
    severity: 'low'
  },
  {
    id: 'audit_3',
    actor: 'Northwind Insights',
    action: 'Failed charge retried',
    target: 'Invoice ' + demoBillingSummary.invoices[0]?.id,
    createdAt: subDays(now, 3).getTime(),
    severity: 'high'
  }
]);
