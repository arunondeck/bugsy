export interface Project {
  id: string;
  accountId: string;
  name: string;
  description?: string | null;
  publicKey: string;
  secretKey: string;
  authorizedDomains: string[];
  widget: Record<string, unknown>;
  status: 'ACTIVE' | 'INACTIVE' | string;
  createdAt: Date;
}
