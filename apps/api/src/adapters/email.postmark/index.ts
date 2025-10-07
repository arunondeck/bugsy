import type { EmailPort } from '../../ports';

export interface PostmarkClient {
  sendEmail(input: { From: string; To: string; Subject: string; TextBody: string }): Promise<void>;
}

export class PostmarkEmailAdapter implements EmailPort {
  constructor(private readonly client: PostmarkClient, private readonly fromAddress: string) {}

  async send(to: string, subject: string, text: string): Promise<void> {
    await this.client.sendEmail({
      From: this.fromAddress,
      To: to,
      Subject: subject,
      TextBody: text
    });
  }

  async sendMagicLink(email: string, link: string): Promise<void> {
    await this.send(email, 'Your Bugsy magic link', `Click to sign in: ${link}`);
  }
}
