import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

import { authMiddleware } from '../middleware/auth';
import { registerAccountRoutes } from '../routes/account';
import { registerAdminRoutes } from '../routes/admin';
import { registerAuthRoutes } from '../routes/auth';
import { registerBillingRoutes } from '../routes/billing';
import { registerFeedbackRoutes } from '../routes/feedback';
import { registerMembersRoutes } from '../routes/members';
import { registerProjectsRoutes } from '../routes/projects';
import { registerUsageRoutes } from '../routes/usage';
import { registerWidgetRoutes } from '../routes/widget';
import type { Ports } from '../../ports';

export type AppEnv = {
  Variables: {
    ports: Ports;
  };
};

export const createApp = (ports: Ports) => {
  const app = new Hono<AppEnv>();

  app.use('*', logger());
  app.use('*', secureHeaders());
  app.use('*', cors());

  app.use('*', async (c, next) => {
    c.set('ports', ports);
    await next();
  });

  app.use('*', authMiddleware);

  const api = app.basePath('/v1');

  registerWidgetRoutes(api);
  registerAuthRoutes(api);
  registerProjectsRoutes(api);
  registerFeedbackRoutes(api);
  registerBillingRoutes(api);
  registerMembersRoutes(api);
  registerUsageRoutes(api);
  registerAccountRoutes(api);
  registerAdminRoutes(api);

  return app;
};

export default createApp;
