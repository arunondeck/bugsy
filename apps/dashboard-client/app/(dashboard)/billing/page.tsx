'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { billingPlanSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleGate } from '@/lib/auth';

export default function BillingPage() {
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: api.listPlans
  });
  const { data: billing } = useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: api.getBillingSummary
  });
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (billing && !selectedPlan) {
      setSelectedPlan(billing.planId);
    }
  }, [billing, selectedPlan]);

  const startCheckout = () => {
    setError(null);
    setSuccess(null);
    const result = billingPlanSchema.safeParse({ planId: selectedPlan });
    if (!result.success) {
      setError('Select a plan before continuing to Stripe checkout.');
      return;
    }
    setSuccess(`Checkout session ready for plan ${selectedPlan}. Connect BillingPort.startCheckout next.`);
  };

  return (
    <RoleGate allowed={['OWNER']} fallback={<BillingFallback />}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
            <p className="text-sm text-muted-foreground">
              Choose the plan that fits your team and trigger Stripe checkout.
            </p>
          </div>
          <Button variant="outline">Open customer portal</Button>
        </div>
        {billing && (
          <Card>
            <CardHeader>
              <CardTitle>Current plan: {billing.planId}</CardTitle>
              <CardDescription>
                Renews on {new Date(billing.renewsAt).toLocaleDateString()} with card ending in
                {billing.paymentMethod ? ` ${billing.paymentMethod.last4}` : ' —'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Latest invoice amount: ${billing.invoices[0]?.amountUsd ?? '0'}
              </p>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const active = selectedPlan === plan.id;
            const limits = plan.limits;
            return (
              <Card key={plan.id} className={active ? 'border-primary shadow-lg' : undefined}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>${plan.priceUsd.toLocaleString()}/mo</CardDescription>
                </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <ul className="space-y-2 text-muted-foreground">
                  <li>Projects: {limits.projects.toLocaleString()}</li>
                  <li>Submissions: {limits.submissions.toLocaleString()} / month</li>
                  {typeof limits.attachmentsMB === 'number' && (
                    <li>Attachments: {limits.attachmentsMB} MB</li>
                  )}
                  <li>Team seats: {plan.features.teamSeats}</li>
                  <li>Captcha: {plan.features.captcha ? 'Included' : 'Optional add-on'}</li>
                  <li>Webhooks: {plan.features.webhooks ? 'Included' : 'Unavailable'}</li>
                </ul>
                <Button
                  variant={active ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  {active ? 'Selected' : 'Select plan'}
                </Button>
              </CardContent>
            </Card>
            );
          })}
          {plans.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No plans available</CardTitle>
                <CardDescription>Publish plans from the admin dashboard to list them here.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
        {error && (
          <p className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        {success && (
          <p className="rounded-md border border-primary bg-primary/10 p-3 text-sm text-primary">{success}</p>
        )}
        <Button onClick={startCheckout} disabled={!selectedPlan}>
          Continue to checkout
        </Button>
      </div>
    </RoleGate>
  );
}

function BillingFallback() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="text-sm text-muted-foreground">
        Only account owners can modify billing settings.
      </p>
    </div>
  );
}
