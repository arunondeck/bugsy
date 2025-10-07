import type { CaptchaPort } from '../../ports';

export interface CaptchaHttpClient {
  verify(input: {
    provider: 'turnstile' | 'hcaptcha';
    token: string;
    remoteIpHash: string;
  }): Promise<boolean>;
}

export class CaptchaVerificationAdapter implements CaptchaPort {
  constructor(private readonly client: CaptchaHttpClient) {}

  verify(provider: 'turnstile' | 'hcaptcha', token: string, remoteIpHash: string): Promise<boolean> {
    return this.client.verify({ provider, token, remoteIpHash });
  }
}
