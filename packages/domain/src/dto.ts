import { z } from 'zod';
import { feedbackFiltersSchema, feedbackSchema, planSchema, projectSchema } from './entities';

const widgetConfigSchema = z.object({
  theme: projectSchema.shape.widget.shape.theme.default('auto'),
  position: projectSchema.shape.widget.shape.position.default('right'),
  captcha: projectSchema.shape.widget.shape.captcha
    .extend({
      provider: projectSchema.shape.widget.shape.captcha.shape.provider.default('none')
    })
    .partial()
    .default({ provider: 'none' }),
  screenshot: projectSchema.shape.widget.shape.screenshot.partial().default({ enabled: true })
});

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(280).optional(),
  authorizedDomains: z.array(z.string().min(1)).default([]),
  widget: widgetConfigSchema.partial().default({})
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = projectCreateSchema
  .partial()
  .extend({
    status: projectSchema.shape.status.optional()
  });

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

export const feedbackUpdateSchema = z
  .object({
    status: feedbackSchema.shape.status.optional(),
    tags: feedbackSchema.shape.tags.optional(),
    body: feedbackSchema.shape.body.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided'
  });

export type FeedbackUpdateInput = z.infer<typeof feedbackUpdateSchema>;

export const feedbackListFiltersSchema = feedbackFiltersSchema.extend({
  projectId: feedbackSchema.shape.projectId.optional()
});

export type FeedbackListFilters = z.infer<typeof feedbackListFiltersSchema>;

export const memberInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'VIEWER'])
});

export type MemberInviteInput = z.infer<typeof memberInviteSchema>;

export const checkoutStartSchema = z.object({
  planId: planSchema.shape.id
});

export type CheckoutStartInput = z.infer<typeof checkoutStartSchema>;
