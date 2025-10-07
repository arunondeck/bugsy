import type { Context } from 'hono';

import type { Ports } from '../../ports';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerAuthRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.post('/auth/magic-link', async (c) => {
    const ports = getPorts(c);
    const body = await c.req.json();
    if (!body.email) {
      return c.json({ error: 'Email required' }, 400);
    }
    await ports.auth.issueMagicToken(body.email);
    return c.json({ ok: true });
  });

  app.post('/auth/verify', async (c) => {
    const ports = getPorts(c);
    const body = await c.req.json();
    if (!body.token) {
      return c.json({ error: 'Token required' }, 400);
    }
    const result = await ports.auth.verifyMagicToken(body.token);
    if (!result) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    return c.json(result);
  });
};
