import type { Context } from 'hono';

import { getOriginHost } from '../../lib/http';
import { hashIp } from '../../lib/crypto';
import { FeedbackSubmitDTO, UploadUrlDTO } from '../../lib/z';
import type { Ports } from '../../ports';
import { buildUploadUrl, submitFeedback } from '../../domain/usecases';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerWidgetRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.post('/feedback', async (c) => {
    const projectKey = c.req.header('x-project-key');
    if (!projectKey) {
      return c.json({ error: 'Missing project key' }, 401);
    }

    const ports = getPorts(c);
    const project = await ports.repo.getProjectByPublicKey(projectKey);
    if (!project) {
      return c.json({ error: 'Invalid project key' }, 401);
    }

    const body = FeedbackSubmitDTO.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: 'Invalid payload', details: body.error.flatten() }, 400);
    }

    const originHost =
      getOriginHost(body.data.context.pageUrl) ??
      (body.data.context.referrer ? getOriginHost(body.data.context.referrer) : null);
    if (project.authorizedDomains.length > 0 && originHost) {
      const allowed = project.authorizedDomains.includes(originHost);
      if (!allowed) {
        return c.json({ error: 'Unauthorized domain' }, 403);
      }
    }

    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? '0.0.0.0';
    const ipHash = hashIp(ip);
    const rateKey = `submit:${project.id}:${ipHash}`;
    const allowed = await ports.rateLimit.check(rateKey, 5, 60);
    if (!allowed) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    const result = await submitFeedback(ports, {
      projectId: project.id,
      title: body.data.title,
      body: body.data.body,
      authorEmail: body.data.email,
      context: body.data.context,
      attachments: body.data.attachments as any,
      captcha: body.data.captcha ?? undefined,
      ipAddress: ip
    });

    if (!result.ok) {
      return c.json({ error: result.error.message, code: result.error.code }, 400);
    }

    return c.json(result.value, 201);
  });

  app.post('/upload-url', async (c) => {
    const projectKey = c.req.header('x-project-key');
    if (!projectKey) {
      return c.json({ error: 'Missing project key' }, 401);
    }

    const ports = getPorts(c);
    const project = await ports.repo.getProjectByPublicKey(projectKey);
    if (!project) {
      return c.json({ error: 'Invalid project key' }, 401);
    }

    const body = UploadUrlDTO.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: 'Invalid payload', details: body.error.flatten() }, 400);
    }

    const result = await buildUploadUrl(ports.storage, body.data.contentType);
    if (!result.ok) {
      return c.json({ error: result.error.message, code: result.error.code }, 400);
    }

    return c.json(result.value);
  });
};
