export interface User {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
  accountId: string;
  createdAt: Date;
}
