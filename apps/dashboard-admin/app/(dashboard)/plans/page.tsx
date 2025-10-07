'use client';

import { useQuery } from '@tanstack/react-query';
import { Pencil, Rocket } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminPlan } from '@/lib/schemas';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlansPage() {
  const { data: plans = [] } = useQuery({ queryKey: ['admin-plans'], queryFn: api.listPlans });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing plans</h1>
          <p className="text-sm text-muted-foreground">
            Tune pricing, limits, and entitlements before publishing to customers.
          </p>
        </div>
        <Button size="sm" onClick={() => console.log('new plan')}>
          Create custom plan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: AdminPlan }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">{plan.name}</CardTitle>
          {plan.published ? (
            <Badge variant="secondary">Published</Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          )}
        </div>
        <CardDescription>ID: {plan.id}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div>
          <p className="text-3xl font-semibold text-foreground">{formatCurrency(plan.priceUsd)}</p>
          <p className="text-sm text-muted-foreground">per month · {plan.trialDays} day trial</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Limits</h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            <li>{plan.limits.projects} projects</li>
            <li>{plan.limits.submissions.toLocaleString()} submissions / mo</li>
            {plan.limits.attachmentsMB && <li>{plan.limits.attachmentsMB} MB attachments</li>}
            {plan.features.teamSeats && <li>{plan.features.teamSeats} team seats included</li>}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Features</h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            <li>{plan.features.captcha ? 'Captcha support' : 'Captcha disabled'}</li>
            <li>{plan.features.webhooks ? 'Webhooks enabled' : 'Webhooks disabled'}</li>
          </ul>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => console.log('edit plan', plan.id)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" onClick={() => console.log('launch plan', plan.id)}>
            <Rocket className="mr-2 h-4 w-4" />
            Launch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
