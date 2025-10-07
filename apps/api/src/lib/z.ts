import { z } from 'zod';

export const FeedbackSubmitDTO = z.object({
  title: z.string().min(3).max(120),
  body: z.string().max(2000).optional(),
  email: z.string().email().optional(),
  profileHash: z.string().optional(),
  includeUser: z.boolean().optional(),
  tags: z.array(z.string()).max(10).optional(),
  context: z.object({
    pageUrl: z.string().url(),
    referrer: z.string().url().optional(),
    ua: z.string(),
    locale: z.string(),
    viewport: z.object({
      w: z.number().int().positive(),
      h: z.number().int().positive()
    })
  }),
  attachments: z
    .array(
      z.object({
        kind: z.literal('screenshot'),
        url: z.string().url()
      })
    )
    .max(3)
    .optional(),
  captcha: z
    .object({
      provider: z.enum(['turnstile', 'hcaptcha']),
      token: z.string()
    })
    .optional()
});

export const ProjectCreateDTO = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  authorizedDomains: z.array(z.string()).default([]),
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
  })
});

export const ProjectUpdateDTO = ProjectCreateDTO.partial();

export const FeedbackUpdateDTO = z.object({
  status: z.enum(['NEW', 'PLANNED', 'IN_PROGRESS', 'DONE']),
  tags: z.array(z.string()).optional(),
  internalNote: z.string().max(2000).optional()
});

export const MemberInviteDTO = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'VIEWER'])
});

export const PlanCreateDTO = z.object({
  name: z.string(),
  price: z.number().int().nonnegative(),
  trialDays: z.number().int().nonnegative().default(0),
  limits: z.object({
    projects: z.number().int(),
    submissions: z.number().int(),
    attachmentsMB: z.number().int().optional()
  }),
  features: z.object({
    captcha: z.boolean(),
    webhooks: z.boolean(),
    teamSeats: z.number().int().default(2)
  }),
  published: z.boolean().default(false)
});

export const PlanUpdateDTO = PlanCreateDTO.partial();

export const UploadUrlDTO = z.object({
  kind: z.literal('image'),
  contentType: z.string()
});

export const Schemas = {
  FeedbackSubmitDTO,
  ProjectCreateDTO,
  ProjectUpdateDTO,
  FeedbackUpdateDTO,
  MemberInviteDTO,
  PlanCreateDTO,
  PlanUpdateDTO,
  UploadUrlDTO
};

export type InferSchema<T extends keyof typeof Schemas> = z.infer<(typeof Schemas)[T]>;
