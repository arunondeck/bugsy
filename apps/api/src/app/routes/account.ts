import type { Context } from 'hono';

import type { Ports } from '../../ports';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerAccountRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.patch('/account', async (c) => {
    const ports = getPorts(c);
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const account = await ports.repo.getAccountByUser(userId);
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }
    return c.json({ updated: true });
  });
};
