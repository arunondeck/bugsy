import { memberSchema, usageSummarySchema } from '@bugsy/domain';
import {
  demoBillingSummary,
  demoFeedback,
  demoPlans,
  demoProjects,
  demoSnippet,
  demoUsage,
  demoUsers
} from '@bugsy/repo-memory';

export const mockProjects = demoProjects;
export const mockFeedback = demoFeedback;
export const mockPlans = demoPlans;
export const mockBillingSummary = demoBillingSummary;
export const mockSnippet = demoSnippet;
export const mockUsageSummary = usageSummarySchema.parse(demoUsage);

export const mockMembers = memberSchema.array().parse(
  demoUsers.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.roles[0] ?? 'VIEWER'
  }))
);
