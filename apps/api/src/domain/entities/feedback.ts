export interface Feedback {
  id: string;
  projectId: string;
  title: string;
  body?: string | null;
  status: 'NEW' | 'PLANNED' | 'IN_PROGRESS' | 'DONE' | string;
  authorEmail?: string | null;
  tags: string[];
  context: Record<string, unknown>;
  attachments: Array<Record<string, unknown>>;
  voteCount: number;
  createdAt: Date;
}
