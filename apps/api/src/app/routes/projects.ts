import type { Context } from 'hono';

import { ProjectCreateDTO, ProjectUpdateDTO } from '../../lib/z';
import type { Ports } from '../../ports';
import { createProject, rotateProjectSecret, updateProject } from '../../domain/usecases';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerProjectsRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.get('/projects', async (c) => {
    const ports = getPorts(c);
    const userId = c.get('userId');
    if (!userId) {
      return c.json([], 200);
    }
    const account = await ports.repo.getAccountByUser(userId);
    if (!account) {
      return c.json([], 200);
    }
    return c.json([]);
  });

  app.post('/projects', async (c) => {
    const ports = getPorts(c);
    const body = ProjectCreateDTO.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: 'Invalid payload', details: body.error.flatten() }, 400);
    }

    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const account = await ports.repo.getAccountByUser(userId);
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }

    const result = await createProject(ports.repo, ports.id, account.id, body.data);
    if (!result.ok) {
      return c.json({ error: result.error.message, code: result.error.code }, 400);
    }

    return c.json(result.value, 201);
  });

  app.get('/projects/:id', async (c) => {
    const ports = getPorts(c);
    const project = await ports.repo.getProjectById(c.req.param('id'));
    if (!project) {
      return c.json({ error: 'Not found' }, 404);
    }
    return c.json(project);
  });

  app.patch('/projects/:id', async (c) => {
    const ports = getPorts(c);
    const body = ProjectUpdateDTO.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: 'Invalid payload', details: body.error.flatten() }, 400);
    }

    const result = await updateProject(ports.repo, c.req.param('id'), body.data as any);
    if (!result.ok) {
      return c.json({ error: result.error.message, code: result.error.code }, 404);
    }

    return c.json(result.value);
  });

  app.get('/projects/:id/keys', async (c) => {
    const ports = getPorts(c);
    const project = await ports.repo.getProjectById(c.req.param('id'));
    if (!project) {
      return c.json({ error: 'Not found' }, 404);
    }
    return c.json({ publicKey: project.publicKey, secretKey: project.secretKey });
  });

  app.post('/projects/:id/keys/rotate', async (c) => {
    const ports = getPorts(c);
    const result = await rotateProjectSecret(ports.repo, c.req.param('id'));
    if (!result.ok) {
      return c.json({ error: result.error.message, code: result.error.code }, 404);
    }
    return c.json(result.value);
  });

  app.post('/projects/:id/toggle', async (c) => {
    const ports = getPorts(c);
    const project = await ports.repo.getProjectById(c.req.param('id'));
    if (!project) {
      return c.json({ error: 'Not found' }, 404);
    }
    const nextStatus = project.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await ports.repo.updateProject(project.id, { status: nextStatus } as any);
    return c.json({ status: nextStatus });
  });

  app.get('/projects/:id/snippet', async (c) => {
    const ports = getPorts(c);
    const project = await ports.repo.getProjectById(c.req.param('id'));
    if (!project) {
      return c.json({ error: 'Not found' }, 404);
    }
    const snippet = `<script src="https://cdn.bugsy.dev/widget.js" data-key="${project.publicKey}"></script>`;
    return c.json({ snippet });
  });
};
