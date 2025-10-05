import type {
  Account,
  BillingSummary,
  Feedback,
  Plan,
  Project,
  ProjectSnippet,
  UsageCounter,
  User
} from '@bugsy/domain';
import type { RepoPort } from '@bugsy/ports';
import {
  demoAccount,
  demoBillingSummary,
  demoFeedback,
  demoPlans,
  demoProjects,
  demoSnippet,
  demoUsage,
  demoUsers
} from './data';

export type MemoryRepoState = {
  account: Account;
  users: User[];
  projects: Project[];
  feedback: Feedback[];
  plans: Plan[];
  snippets: Record<string, ProjectSnippet>;
  billing: BillingSummary;
  usageCounters: Record<string, UsageCounter>;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const defaultState: MemoryRepoState = {
  account: demoAccount,
  users: demoUsers,
  projects: demoProjects,
  feedback: demoFeedback,
  plans: demoPlans,
  snippets: { [demoSnippet.projectId]: demoSnippet },
  billing: demoBillingSummary,
  usageCounters: {
    [`${demoUsage.period}:${demoAccount.id}`]: {
      accountId: demoAccount.id,
      period: demoUsage.period,
      submissions: demoUsage.submissions,
      attachmentsMB: demoUsage.attachmentsMB,
      projects: demoUsage.projects,
      seats: demoUsage.seats
    }
  }
};

export function createMemoryRepo(initialState: Partial<MemoryRepoState> = {}): RepoPort {
  const state: MemoryRepoState = {
    ...defaultState,
    ...initialState,
    users: initialState.users ?? clone(defaultState.users),
    projects: initialState.projects ?? clone(defaultState.projects),
    feedback: initialState.feedback ?? clone(defaultState.feedback),
    plans: initialState.plans ?? clone(defaultState.plans),
    snippets: initialState.snippets ?? { ...defaultState.snippets },
    usageCounters: initialState.usageCounters ?? { ...defaultState.usageCounters }
  };

  return {
    async getAccount(id) {
      return id === state.account.id ? clone(state.account) : null;
    },

    async getUserByEmail(email) {
      const user = state.users.find((candidate) => candidate.email === email);
      return user ? clone(user) : null;
    },

    async createUser(user) {
      state.users.push(clone(user));
    },

    async listMembers(accountId) {
      return state.users.filter((user) => user.accountId === accountId).map(clone);
    },

    async listProjects(accountId) {
      return state.projects.filter((project) => project.accountId === accountId).map(clone);
    },

    async createProject(project) {
      state.projects.push(clone(project));
      return clone(project);
    },

    async getProjectById(id) {
      const project = state.projects.find((candidate) => candidate.id === id);
      return project ? clone(project) : null;
    },

    async getProjectByPublicKey(pk) {
      const project = state.projects.find((candidate) => candidate.publicKey === pk);
      return project ? clone(project) : null;
    },

    async updateProject(id, patch) {
      const index = state.projects.findIndex((project) => project.id === id);
      if (index === -1) {
        return null;
      }

      const updated = { ...state.projects[index], ...clone(patch) } as Project;
      state.projects[index] = updated;
      return clone(updated);
    },

    async createFeedback(feedback) {
      state.feedback.push(clone(feedback));
      return clone(feedback);
    },

    async getFeedbackById(id) {
      const feedback = state.feedback.find((item) => item.id === id);
      return feedback ? clone(feedback) : null;
    },

    async listFeedback(projectId, filters) {
      const filtered = state.feedback.filter((item) => item.projectId === projectId);
      if (!filters) {
        return filtered.map(clone);
      }

      let result = filtered;
      if (Array.isArray((filters as { status?: string[] }).status)) {
        const statuses = new Set((filters as { status?: string[] }).status);
        result = result.filter((item) => statuses.has(item.status));
      }
      if (Array.isArray((filters as { tags?: string[] }).tags)) {
        const tags = new Set((filters as { tags?: string[] }).tags);
        result = result.filter((item) => item.tags.some((tag) => tags.has(tag)));
      }
      return result.map(clone);
    },

    async updateFeedback(id, patch) {
      const index = state.feedback.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }
      const updated = { ...state.feedback[index], ...clone(patch) } as Feedback;
      state.feedback[index] = updated;
      return clone(updated);
    },

    async incrementUsage(accountId, countersPatch) {
      const existingKey = Object.keys(state.usageCounters).find((item) => item.endsWith(`:${accountId}`));
      const usageKey = existingKey ?? `${new Date().toISOString().slice(0, 7)}:${accountId}`;
      const existing = state.usageCounters[usageKey] ?? {
        accountId,
        period: usageKey.split(':')[0],
        submissions: 0,
        attachmentsMB: 0,
        projects: 0,
        seats: 0
      };
      state.usageCounters[usageKey] = {
        ...existing,
        submissions: existing.submissions + (countersPatch.submissions ?? 0),
        attachmentsMB: existing.attachmentsMB + (countersPatch.attachmentsMB ?? 0),
        projects: Math.max(existing.projects, countersPatch.projects ?? existing.projects),
        seats: Math.max(existing.seats, countersPatch.seats ?? existing.seats)
      };
    },

    async getUsage(accountId, period) {
      const key = `${period}:${accountId}`;
      const usage = state.usageCounters[key];
      return usage ? clone(usage) : null;
    },

    async listPlans(publishedOnly) {
      const plans = publishedOnly ? state.plans.filter((plan) => plan.published) : state.plans;
      return plans.map(clone);
    },

    async createPlan(plan) {
      state.plans.push(clone(plan));
      return clone(plan);
    },

    async updatePlan(id, patch) {
      const index = state.plans.findIndex((plan) => plan.id === id);
      if (index === -1) {
        return null;
      }
      const updated = { ...state.plans[index], ...clone(patch) } as Plan;
      state.plans[index] = updated;
      return clone(updated);
    },

    async getProjectSnippet(id) {
      const snippet = state.snippets[id];
      return snippet ? clone(snippet) : null;
    }
  } satisfies RepoPort;
}

export function createDemoMemoryRepo() {
  return createMemoryRepo();
}

export {
  demoAccount,
  demoBillingSummary,
  demoFeedback,
  demoPlans,
  demoProjects,
  demoSnippet,
  demoUsage,
  demoUsers
} from './data';
