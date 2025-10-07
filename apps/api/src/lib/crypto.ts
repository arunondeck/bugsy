import crypto from 'node:crypto';

export const hashIp = (ip: string): string =>
  crypto.createHash('sha256').update(ip).digest('hex');

export const stableHash = (value: string): string =>
  crypto.createHash('sha256').update(value).digest('base64url');

export const signWebhook = (payload: string, secret: string): string =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex');
