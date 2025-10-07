import type { Context } from 'hono';

import type { Ports } from '../../ports';
import { getBillingSummary, startCheckout } from '../../domain/usecases';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerBillingRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.get('/plans/public', async (c) => {
    const ports = getPorts(c);
    const plans = await ports.repo.listPlans(true);
    return c.json(plans);
  });

  app.post('/billing/checkout', async (c) => {
    const ports = getPorts(c);
    const body = await c.req.json();
    const accountId = body.accountId ?? c.get('userId');
    if (!accountId) {
      return c.json({ error: 'Missing account' }, 400);
    }
    const planId = body.planId;
    const result = await startCheckout(ports.billing, accountId, planId);
    if (!result.ok) {
      return c.json({ error: result.error.message }, 400);
    }
    return c.json(result.value);
  });

  app.get('/billing/summary', async (c) => {
    const ports = getPorts(c);
    const accountId = c.get('userId');
    if (!accountId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const result = await getBillingSummary(ports.billing, accountId);
    if (!result.ok) {
      return c.json({ error: result.error.message }, 400);
    }
    return c.json(result.value);
  });

  app.post('/billing/portal', async (c) => {
    const ports = getPorts(c);
    const accountId = c.get('userId');
    if (!accountId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const portal = await ports.billing.openCustomerPortal(accountId);
    return c.json(portal);
  });
};
