import type { Context } from 'hono';

import { MemberInviteDTO } from '../../lib/z';
import type { Ports } from '../../ports';
import { inviteMember } from '../../domain/usecases';
import type { AppEnv } from '../server';

const getPorts = (c: Context<AppEnv>): Ports => c.get('ports');

export const registerMembersRoutes = (app: import('hono').Hono<AppEnv>) => {
  app.get('/members', async (c) => {
    const ports = getPorts(c);
    const userId = c.get('userId');
    if (!userId) {
      return c.json([], 200);
    }
    const account = await ports.repo.getAccountByUser(userId);
    if (!account) {
      return c.json([], 200);
    }
    const members = await ports.repo.listMembers(account.id);
    return c.json(members);
  });

  app.post('/members/invite', async (c) => {
    const ports = getPorts(c);
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const account = await ports.repo.getAccountByUser(userId);
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }

    const body = MemberInviteDTO.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: 'Invalid payload', details: body.error.flatten() }, 400);
    }

    const result = await inviteMember(ports.repo, ports.email, account.id, body.data.email, body.data.role);
    if (!result.ok) {
      return c.json({ error: result.error.message }, 400);
    }

    return c.json({ invited: true });
  });
};
