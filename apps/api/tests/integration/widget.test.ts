import { describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/app/server';
import { InMemoryRepoAdapter } from '../../src/adapters/repo.memory';
import { hashIp } from '../../src/lib/crypto';
import type { Ports } from '../../src/ports';
import type {
  BillingPort,
  CaptchaPort,
  RateLimitPort,
  StoragePort
} from '../../src/ports';

const accountId = 'acc_test';
const projectId = 'proj_test';
const projectKey = 'pk_test_project';
const allowedDomain = 'feedback.example.com';

const buildPorts = (options?: {
  authorizedDomains?: string[];
  rateLimitAllowed?: boolean;
  captchaAllowed?: boolean;
}) => {
  const repo = new InMemoryRepoAdapter({
    accounts: [
      {
        id: accountId,
        name: 'Acme Corp',
        planId: 'plan_basic',
        createdAt: new Date('2024-01-01T00:00:00Z')
      }
    ],
    users: [],
    projects: [
      {
        id: projectId,
        accountId,
        name: 'Main project',
        description: null,
        publicKey: projectKey,
        secretKey: 'sk_test',
        authorizedDomains: options?.authorizedDomains ?? [allowedDomain],
        widget: { theme: 'auto' },
        status: 'ACTIVE',
        createdAt: new Date('2024-01-02T00:00:00Z')
      }
    ],
    feedback: [],
    plans: [],
    usage: new Map()
  });

  const captcha: CaptchaPort = {
    verify: vi
      .fn()
      .mockResolvedValue(options?.captchaAllowed ?? true)
  };

  const rateLimit: RateLimitPort = {
    check: vi.fn().mockResolvedValue(options?.rateLimitAllowed ?? true)
  };

  const storage: StoragePort = {
    presign: vi.fn().mockResolvedValue({
      url: 'https://storage.example.com/upload',
      publicUrl: 'https://cdn.example.com/image.png'
    })
  };

  const billing: BillingPort = {
    startCheckout: vi.fn().mockResolvedValue({ checkoutUrl: 'https://stripe.example/checkout' }),
    getBillingSummary: vi.fn().mockResolvedValue({}),
    openCustomerPortal: vi.fn().mockResolvedValue({ url: 'https://stripe.example/portal' })
  };

  const ports: Ports = {
    repo,
    email: {
      send: vi.fn(),
      sendMagicLink: vi.fn()
    },
    billing,
    captcha,
    storage,
    rateLimit,
    auth: {
      issueMagicToken: vi.fn(),
      verifyMagicToken: vi.fn().mockResolvedValue(null)
    },
    id: {
      next: vi.fn().mockReturnValue('id_123')
    },
    clock: {
      now: vi.fn().mockReturnValue(new Date('2024-01-15T00:00:00Z'))
    }
  };

  return { ports, repo, captcha, rateLimit, storage };
};

describe('widget routes', () => {
  it('accepts valid submissions and records feedback', async () => {
    const { ports, repo, captcha, rateLimit } = buildPorts();
    const app = createApp(ports);
    const ip = '203.0.113.10';
    const response = await app.request('/v1/feedback', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-project-key': projectKey,
        'x-forwarded-for': ip
      },
      body: JSON.stringify({
        title: 'Found a bug',
        body: 'Steps to reproduce...',
        email: 'user@example.com',
        context: {
          pageUrl: `https://${allowedDomain}/page`,
          referrer: `https://${allowedDomain}/home`,
          ua: 'vitest',
          locale: 'en-US',
          viewport: { w: 1280, h: 720 }
        },
        captcha: { provider: 'turnstile', token: 'captcha-token' }
      })
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({ status: 'NEW' });

    const ipHash = hashIp(ip);
    expect(captcha.verify).toHaveBeenCalledWith('turnstile', 'captcha-token', ipHash);
    expect(rateLimit.check).toHaveBeenCalledWith(`submit:${projectId}:${ipHash}`, 5, 60);

    const feedback = await repo.listFeedback(projectId);
    expect(feedback).toHaveLength(1);

    const period = new Date().toISOString().slice(0, 7);
    const usage = await repo.getUsage(accountId, period);
    expect(usage?.submissions).toBe(1);
  });

  it('rejects submissions from unauthorized domains', async () => {
    const { ports, repo } = buildPorts({ authorizedDomains: [allowedDomain] });
    const app = createApp(ports);

    const response = await app.request('/v1/feedback', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-project-key': projectKey
      },
      body: JSON.stringify({
        title: 'spam',
        context: {
          pageUrl: 'https://evil.example.com',
          ua: 'test',
          locale: 'en-US',
          viewport: { w: 1024, h: 768 }
        }
      })
    });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized domain');

    const feedback = await repo.listFeedback(projectId);
    expect(feedback).toHaveLength(0);
  });

  it('returns 429 when rate limit denies the request', async () => {
    const { ports, rateLimit } = buildPorts({ rateLimitAllowed: false });
    const app = createApp(ports);

    const response = await app.request('/v1/feedback', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-project-key': projectKey
      },
      body: JSON.stringify({
        title: 'Rate limited request',
        context: {
          pageUrl: `https://${allowedDomain}/`,
          ua: 'test',
          locale: 'en-US',
          viewport: { w: 1024, h: 768 }
        }
      })
    });

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ error: 'Rate limit exceeded' });
    expect(rateLimit.check).toHaveBeenCalled();
  });

  it('rejects when captcha verification fails', async () => {
    const { ports, captcha } = buildPorts({ captchaAllowed: false });
    const app = createApp(ports);

    const response = await app.request('/v1/feedback', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-project-key': projectKey
      },
      body: JSON.stringify({
        title: 'Captcha failure',
        context: {
          pageUrl: `https://${allowedDomain}/page`,
          ua: 'test',
          locale: 'en-US',
          viewport: { w: 1024, h: 768 }
        },
        captcha: { provider: 'turnstile', token: 'bad-token' }
      })
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'Captcha validation failed' });
    expect(captcha.verify).toHaveBeenCalled();
  });

  it('returns a presigned upload URL for authorized projects', async () => {
    const { ports, storage } = buildPorts();
    const app = createApp(ports);

    const response = await app.request('/v1/upload-url', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-project-key': projectKey
      },
      body: JSON.stringify({
        kind: 'image',
        contentType: 'image/png'
      })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      url: 'https://storage.example.com/upload',
      publicUrl: 'https://cdn.example.com/image.png'
    });
    expect(storage.presign).toHaveBeenCalledWith('image', 'image/png');
  });
});
