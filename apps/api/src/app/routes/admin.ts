import type { Context } from 'hono';

import type { Ports } from '../../ports';
import { adminCreatePlan, adminUpdatePlan } from '../../domain/usecases';
import { PlanCreateDTO, PlanUpdateDTO } from '../../lib/z';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerAdminRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.get('/admin/metrics/kpis', async (c) => c.json({}));
  app.get('/admin/metrics/queues', async (c) => c.json([]));
  app.get('/admin/metrics/errors', async (c) => c.json([]));
  app.get('/admin/users', async (c) => c.json([]));
  app.post('/admin/users/:id/impersonate', async (c) => c.json({}));
  app.post('/admin/users/:id/disable', async (c) => c.json({ disabled: true }));
  app.get('/admin/accounts', async (c) => c.json([]));
  app.get('/admin/accounts/:id', async (c) => c.json({}));
  app.get('/admin/accounts/:id/usage', async (c) => c.json({}));
  app.get('/admin/accounts/:id/overrides', async (c) => c.json({}));
  app.post('/admin/accounts/:id/overrides', async (c) => c.json({ saved: true }));
  app.post('/admin/accounts/:id/stripe', async (c) => c.json({ url: '' }));
  app.get('/admin/payments', async (c) => c.json([]));
  app.get('/admin/stripe/logs', async (c) => c.json([]));

  app.get('/admin/plans', async (c) => {
    const ports = getPorts(c);
    return c.json(await ports.repo.listPlans(false));
  });

  app.post('/admin/plans', async (c) => {
    const ports = getPorts(c);
    const body = PlanCreateDTO.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: 'Invalid payload', details: body.error.flatten() }, 400);
    }
    const result = await adminCreatePlan(ports.repo, {
      name: body.data.name,
      priceUsd: body.data.price,
      trialDays: body.data.trialDays,
      limits: body.data.limits,
      features: body.data.features,
      published: body.data.published
    });
    if (!result.ok) {
      return c.json({ error: result.error.message }, 400);
    }
    return c.json(result.value, 201);
  });

  app.get('/admin/plans/:id', async (c) => {
    const ports = getPorts(c);
    const plan = (await ports.repo.listPlans(false)).find((p) => p.id === c.req.param('id'));
    if (!plan) {
      return c.json({ error: 'Not found' }, 404);
    }
    return c.json(plan);
  });

  app.patch('/admin/plans/:id', async (c) => {
    const ports = getPorts(c);
    const body = PlanUpdateDTO.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: 'Invalid payload', details: body.error.flatten() }, 400);
    }
    const result = await adminUpdatePlan(ports.repo, c.req.param('id'), {
      name: body.data.name,
      priceUsd: body.data.price,
      trialDays: body.data.trialDays,
      limits: body.data.limits,
      features: body.data.features,
      published: body.data.published
    });
    if (!result.ok) {
      return c.json({ error: result.error.message }, 404);
    }
    return c.json(result.value);
  });

  app.post('/admin/config', async (c) => c.json({ saved: true }));
  app.get('/admin/audit', async (c) => c.json([]));
};
