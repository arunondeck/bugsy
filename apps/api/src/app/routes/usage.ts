import type { Context } from 'hono';

import type { Ports } from '../../ports';
import { getUsageSummary } from '../../domain/usecases';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerUsageRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.get('/usage/summary', async (c) => {
    const ports = getPorts(c);
    const userId = c.get('userId');
    if (!userId) {
      return c.json({});
    }
    const account = await ports.repo.getAccountByUser(userId);
    if (!account) {
      return c.json({});
    }
    const result = await getUsageSummary(ports.repo, account.id);
    if (!result.ok) {
      return c.json({ error: result.error.message }, 400);
    }
    return c.json(result.value);
  });

  app.get('/usage/timeseries', async (c) => c.json([]));
  app.get('/limits/effective', async (c) => c.json({}));
};
