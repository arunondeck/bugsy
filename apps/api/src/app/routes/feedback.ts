import type { Context } from 'hono';

import { FeedbackUpdateDTO } from '../../lib/z';
import type { Ports } from '../../ports';
import { listFeedback, updateFeedback } from '../../domain/usecases';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerFeedbackRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.get('/feedback', async (c) => {
    const projectId = c.req.query('projectId');
    if (!projectId) {
      return c.json([]);
    }
    const ports = getPorts(c);
    const result = await listFeedback(ports.repo, projectId, {});
    if (!result.ok) {
      return c.json({ error: result.error.message }, 404);
    }
    return c.json(result.value);
  });

  app.get('/feedback/:id', async (c) => {
    const ports = getPorts(c);
    const feedback = await ports.repo.getFeedback(c.req.param('id'));
    if (!feedback) {
      return c.json({ error: 'Not found' }, 404);
    }
    return c.json(feedback);
  });

  app.patch('/feedback/:id', async (c) => {
    const ports = getPorts(c);
    const body = FeedbackUpdateDTO.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: 'Invalid payload', details: body.error.flatten() }, 400);
    }
    const result = await updateFeedback(ports.repo, c.req.param('id'), body.data as any);
    if (!result.ok) {
      return c.json({ error: result.error.message }, 404);
    }
    return c.json(result.value);
  });

  app.post('/feedback/bulk/status', async (c) => c.json({ updated: [] }));
  app.post('/feedback/bulk/tag', async (c) => c.json({ updated: [] }));
  app.post('/feedback/export', async (c) => c.json({ url: 'https://example.com/export.csv' }));
  app.get('/feedback/domains', async (c) => c.json([]));
};
