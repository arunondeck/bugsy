import { z } from 'zod';

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  planId: z.string(),
  createdAt: z.number()
});

export type Account = z.infer<typeof accountSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  accountId: z.string(),
  roles: z.array(z.enum(['OWNER', 'ADMIN', 'VIEWER'])),
  createdAt: z.number()
});

export type User = z.infer<typeof userSchema>;

export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceUsd: z.number(),
  trialDays: z.number(),
  limits: z.object({
    projects: z.number(),
    submissions: z.number(),
    attachmentsMB: z.number().optional(),
    seats: z.number().optional()
  }),
  features: z.object({
    captcha: z.boolean(),
    webhooks: z.boolean(),
    teamSeats: z.number()
  }),
  published: z.boolean()
});

export type Plan = z.infer<typeof planSchema>;

export const projectSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  publicKey: z.string(),
  secretKey: z.string(),
  authorizedDomains: z.array(z.string()),
  widget: z.object({
    theme: z.enum(['auto', 'light', 'dark']),
    position: z.enum(['right', 'left']),
    captcha: z.object({
      provider: z.enum(['none', 'turnstile', 'hcaptcha']),
      siteKey: z.string().optional()
    }),
    screenshot: z.object({
      enabled: z.boolean()
    })
  }),
  status: z.enum(['ACTIVE', 'PAUSED']),
  createdAt: z.number(),
  submissionsThisWeek: z.number().default(0)
});

export type Project = z.infer<typeof projectSchema>;

export const feedbackSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().max(120),
  body: z.string().max(2000).optional(),
  status: z.enum(['NEW', 'PLANNED', 'IN_PROGRESS', 'DONE']),
  authorEmail: z.string().email().optional(),
  tags: z.array(z.string()),
  createdAt: z.number(),
  context: z.object({
    pageUrl: z.string(),
    referrer: z.string().optional(),
    ua: z.string(),
    locale: z.string(),
    viewport: z.object({
      w: z.number(),
      h: z.number()
    })
  }),
  attachments: z
    .array(
      z.object({
        kind: z.literal('screenshot'),
        url: z.string()
      })
    )
    .default([]),
  voteCount: z.number()
});

export type Feedback = z.infer<typeof feedbackSchema>;

export const usageCounterSchema = z.object({
  accountId: z.string(),
  period: z.string(),
  submissions: z.number(),
  attachmentsMB: z.number(),
  projects: z.number(),
  seats: z.number()
});

export type UsageCounter = z.infer<typeof usageCounterSchema>;

export const usageSummarySchema = z.object({
  period: z.string(),
  submissions: z.number(),
  attachmentsMB: z.number(),
  projects: z.number(),
  seats: z.number(),
  quota: z.object({
    submissions: z.number(),
    attachmentsMB: z.number(),
    projects: z.number(),
    seats: z.number()
  })
});

export type UsageSummary = z.infer<typeof usageSummarySchema>;

export const billingInvoiceSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  amountUsd: z.number(),
  status: z.enum(['paid', 'open', 'past_due'])
});

export const billingSummarySchema = z.object({
  planId: z.string(),
  renewsAt: z.number(),
  paymentMethod: z
    .object({
      brand: z.string(),
      last4: z.string(),
      expMonth: z.number(),
      expYear: z.number()
    })
    .optional(),
  invoices: billingInvoiceSchema.array().default([])
});

export type BillingSummary = z.infer<typeof billingSummarySchema>;

export const projectSnippetSchema = z.object({
  projectId: z.string(),
  embedSnippet: z.string()
});

export type ProjectSnippet = z.infer<typeof projectSnippetSchema>;

export const dashboardSessionSchema = z.object({
  userId: z.string(),
  accountId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  roles: z.array(z.enum(['OWNER', 'ADMIN', 'VIEWER'])).min(1)
});

export type DashboardSession = z.infer<typeof dashboardSessionSchema>;

export const feedbackFiltersSchema = z.object({
  status: z.array(z.enum(['NEW', 'PLANNED', 'IN_PROGRESS', 'DONE'])).optional(),
  tags: z.array(z.string()).optional()
});

export type FeedbackFilters = z.infer<typeof feedbackFiltersSchema>;

export const memberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['OWNER', 'ADMIN', 'VIEWER'])
});

export type Member = z.infer<typeof memberSchema>;
