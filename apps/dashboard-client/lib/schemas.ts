import { z } from 'zod';

export const projectCreateSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().max(200).optional(),
  domains: z.array(z.string().min(1, 'Provide a hostname or URL')).min(1),
  theme: z.enum(['auto', 'light', 'dark']).default('auto'),
  position: z.enum(['left', 'right']).default('right'),
  screenshot: z.boolean().default(true),
  captcha: z.object({
    provider: z.enum(['none', 'turnstile', 'hcaptcha']),
    siteKey: z.string().optional()
  })
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const feedbackFiltersSchema = z.object({
  status: z.enum(['ALL', 'NEW', 'PLANNED', 'IN_PROGRESS', 'DONE']).default('ALL'),
  tags: z.array(z.string()).optional(),
  search: z.string().optional()
});

export const memberInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'VIEWER']).default('VIEWER')
});

export const billingPlanSchema = z.object({
  planId: z.string().min(1)
});

export const settingsSchema = z.object({
  name: z.string().min(2),
  notificationEmail: z.string().email(),
  weeklyDigest: z.boolean().default(true)
});
