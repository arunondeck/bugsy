import type { MiddlewareHandler } from 'hono';

import { hashIp } from '../../lib/crypto';
import type { RateLimitPort } from '../../ports';

export const rateLimitMiddleware = (
  rate: RateLimitPort,
  options: { key: string; limit: number; windowSec: number }
): MiddlewareHandler => {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? '0.0.0.0';
    const ipHash = hashIp(ip);
    const key = options.key.replace('{ipHash}', ipHash);
    const allowed = await rate.check(key, options.limit, options.windowSec);
    if (!allowed) {
      return c.json({ error: 'Too many requests' }, 429);
    }
    c.set('ipHash', ipHash);
    await next();
  };
};
