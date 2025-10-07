import type { Context, MiddlewareHandler } from 'hono';

const isPublicRoute = (c: Context) => {
  if (!c.req.path.startsWith('/v1')) {
    return true;
  }
  return c.req.path.startsWith('/v1/feedback') || c.req.path.startsWith('/v1/upload-url');
};

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (isPublicRoute(c)) {
    await next();
    return;
  }

  const session = c.req.header('x-user-id');
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', session);
  await next();
};
