import type { AuthPort } from '../../ports';

export interface MagicLinkStore {
  issue(email: string): Promise<void>;
  verify(token: string): Promise<{ userId: string; accountId: string } | null>;
}

export class MagicLinkAuthAdapter implements AuthPort {
  constructor(private readonly store: MagicLinkStore) {}

  issueMagicToken(email: string): Promise<void> {
    return this.store.issue(email);
  }

  verifyMagicToken(token: string): Promise<{ userId: string; accountId: string } | null> {
    return this.store.verify(token);
  }
}
