import type { BillingPort } from '../../ports';

export interface StripeCheckoutClient {
  createCheckoutSession(input: { accountId: string; planId: string }): Promise<{ url: string }>;
  getSummary(accountId: string): Promise<Record<string, unknown>>;
  createCustomerPortal(accountId: string): Promise<{ url: string }>;
}

export class StripeBillingAdapter implements BillingPort {
  constructor(private readonly client: StripeCheckoutClient) {}

  async startCheckout(accountId: string, planId: string): Promise<{ checkoutUrl: string }> {
    const session = await this.client.createCheckoutSession({ accountId, planId });
    return { checkoutUrl: session.url };
  }

  async getBillingSummary(accountId: string): Promise<Record<string, unknown>> {
    return this.client.getSummary(accountId);
  }

  async openCustomerPortal(accountId: string): Promise<{ url: string }> {
    return this.client.createCustomerPortal(accountId);
  }
}
