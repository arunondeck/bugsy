import { addDays, subDays } from 'date-fns';
import {
  accountSchema,
  billingSummarySchema,
  feedbackSchema,
  planSchema,
  projectSchema,
  projectSnippetSchema,
  usageSummarySchema,
  userSchema
} from '@bugsy/domain';

const now = new Date();

export const demoAccount = accountSchema.parse({
  id: 'acct_123',
  name: 'Acme Feedback Co',
  planId: 'growth',
  createdAt: subDays(now, 180).getTime()
});

export const demoUsers = userSchema.array().parse([
  { id: 'user_1', name: 'Demo Owner', email: 'owner@example.com', accountId: demoAccount.id, roles: ['OWNER', 'ADMIN'], createdAt: subDays(now, 170).getTime() },
  { id: 'user_2', name: 'Harper Admin', email: 'harper@example.com', accountId: demoAccount.id, roles: ['ADMIN'], createdAt: subDays(now, 90).getTime() },
  { id: 'user_3', name: 'Riley Viewer', email: 'riley@example.com', accountId: demoAccount.id, roles: ['VIEWER'], createdAt: subDays(now, 30).getTime() }
]);

export const demoProjects = projectSchema.array().parse([
  {
    id: 'proj_123',
    accountId: demoAccount.id,
    name: 'Marketing Site',
    description: 'Collect feedback from the marketing funnel.',
    status: 'ACTIVE',
    publicKey: 'pk_live_marketing',
    secretKey: 'sk_live_marketing',
    authorizedDomains: ['https://marketing.example.com', 'https://demo.example.com'],
    widget: {
      theme: 'auto',
      position: 'right',
      captcha: { provider: 'turnstile', siteKey: 'turnstile_marketing' },
      screenshot: { enabled: true }
    },
    createdAt: subDays(now, 45).getTime(),
    submissionsThisWeek: 42
  },
  {
    id: 'proj_456',
    accountId: demoAccount.id,
    name: 'SaaS App Widget',
    description: 'In-app reporter for authenticated users.',
    status: 'PAUSED',
    publicKey: 'pk_live_saas',
    secretKey: 'sk_live_saas',
    authorizedDomains: ['https://app.example.com'],
    widget: {
      theme: 'dark',
      position: 'left',
      captcha: { provider: 'turnstile', siteKey: 'turnstile_app' },
      screenshot: { enabled: false }
    },
    createdAt: subDays(now, 120).getTime(),
    submissionsThisWeek: 12
  }
]);

export const demoFeedback = feedbackSchema.array().parse([
  {
    id: 'fd_123',
    projectId: 'proj_123',
    title: 'Button misaligned on mobile',
    status: 'NEW',
    tags: ['ui', 'mobile'],
    createdAt: subDays(now, 1).getTime(),
    authorEmail: 'alex@example.com',
    body: 'On iPhone 12 the submit button overlaps the footer.',
    context: {
      pageUrl: 'https://marketing.example.com/pricing',
      referrer: 'https://google.com',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      locale: 'en-US',
      viewport: { w: 390, h: 844 }
    },
    attachments: [],
    voteCount: 2
  },
  {
    id: 'fd_456',
    projectId: 'proj_456',
    title: 'Feature request: dark mode toggle',
    status: 'PLANNED',
    tags: ['feature'],
    createdAt: subDays(now, 4).getTime(),
    authorEmail: 'jamie@example.com',
    body: 'We would love a dark theme option for late-night usage.',
    context: {
      pageUrl: 'https://app.example.com/dashboard',
      referrer: 'https://app.example.com/projects',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4)',
      locale: 'en-GB',
      viewport: { w: 1440, h: 900 }
    },
    attachments: [
      {
        kind: 'screenshot',
        url: 'https://cdn.example.com/screenshots/fd_456.png'
      }
    ],
    voteCount: 17
  }
]);

export const demoUsage = usageSummarySchema.parse({
  period: '2024-06',
  submissions: 128,
  attachmentsMB: 45,
  projects: demoProjects.length,
  seats: demoUsers.length,
  quota: {
    submissions: 1000,
    attachmentsMB: 512,
    projects: 5,
    seats: 10
  }
});

export const demoPlans = planSchema.array().parse([
  {
    id: 'starter',
    name: 'Starter',
    priceUsd: 39,
    trialDays: 14,
    limits: { projects: 3, submissions: 1000, attachmentsMB: 256 },
    features: { captcha: true, webhooks: false, teamSeats: 3 },
    published: true
  },
  {
    id: 'growth',
    name: 'Growth',
    priceUsd: 99,
    trialDays: 14,
    limits: { projects: 10, submissions: 5000, attachmentsMB: 1024 },
    features: { captcha: true, webhooks: true, teamSeats: 10 },
    published: true
  },
  {
    id: 'scale',
    name: 'Scale',
    priceUsd: 199,
    trialDays: 0,
    limits: { projects: 25, submissions: 20000, attachmentsMB: 4096 },
    features: { captcha: true, webhooks: true, teamSeats: 25 },
    published: true
  }
]);

export const demoBillingSummary = billingSummarySchema.parse({
  planId: 'growth',
  renewsAt: addDays(now, 23).getTime(),
  paymentMethod: {
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2026
  },
  invoices: [
    {
      id: 'inv_456',
      createdAt: subDays(now, 2).getTime(),
      amountUsd: 99,
      status: 'open'
    },
    {
      id: 'inv_123',
      createdAt: subDays(now, 32).getTime(),
      amountUsd: 99,
      status: 'paid'
    }
  ]
});

export const demoSnippet = projectSnippetSchema.parse({
  projectId: 'proj_123',
  embedSnippet:
    "<script>window.FBW_INIT={projectKey:'pk_live_marketing',theme:'auto',position:'right'};</script>\n" +
    "<script async src='https://cdn.example.com/embed.js'></script>"
});
