import type { RateLimitPort } from '../../ports';

export interface TokenBucketStore {
  take(key: string, limit: number, windowSec: number): Promise<boolean>;
}

export class RedisRateLimitAdapter implements RateLimitPort {
  constructor(private readonly store: TokenBucketStore) {}

  check(key: string, limit: number, windowSec: number): Promise<boolean> {
    return this.store.take(key, limit, windowSec);
  }
}
