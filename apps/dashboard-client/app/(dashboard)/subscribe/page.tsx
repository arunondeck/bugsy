'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleGate } from '@/lib/auth';

export default function SubscribePage() {
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: api.listPlans
  });

  return (
    <RoleGate allowed={['OWNER']} fallback={<SubscribeFallback />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Choose your plan</h1>
          <p className="text-sm text-muted-foreground">
            Upgrade to unlock more projects, seats, and automation features.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                <span className="text-2xl font-semibold text-foreground">${plan.priceUsd.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground"> / month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ul className="space-y-2 text-muted-foreground">
                <li>Projects: {plan.limits.projects.toLocaleString()}</li>
                <li>Submissions: {plan.limits.submissions.toLocaleString()} / month</li>
                {typeof plan.limits.attachmentsMB === 'number' && (
                  <li>Attachments: {plan.limits.attachmentsMB} MB</li>
                )}
                <li>Seats included: {plan.features.teamSeats}</li>
                <li>Captcha: {plan.features.captcha ? 'Included' : 'Upgrade required'}</li>
                <li>Webhooks: {plan.features.webhooks ? 'Included' : 'Not available'}</li>
              </ul>
              <Button className="w-full">Start trial</Button>
            </CardContent>
            </Card>
          ))}
          {plans.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No plans published</CardTitle>
                <CardDescription>Check back soon for available subscriptions.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </RoleGate>
  );
}

function SubscribeFallback() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Choose your plan</h1>
      <p className="text-sm text-muted-foreground">
        Only account owners can upgrade or downgrade plans.
      </p>
    </div>
  );
}
