'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RoleGate } from '@/lib/auth';

const metricLabels: Record<string, string> = {
  submissions: 'Submissions',
  attachmentsMB: 'Attachments (MB)',
  projects: 'Projects',
  seats: 'Seats'
};

export default function UsagePage() {
  const { data: usage } = useQuery({
    queryKey: ['usage', 'summary'],
    queryFn: api.getUsageSummary
  });

  return (
    <RoleGate allowed={['OWNER', 'ADMIN']} fallback={<UsageFallback />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
          <p className="text-sm text-muted-foreground">
            Monitor plan consumption and anticipate capacity alerts.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {usage
            ? Object.entries(metricLabels).map(([key, label]) => {
              const current = usage[key as keyof typeof usage] as number;
              const limit = usage.quota[key as keyof typeof usage.quota] as number;
              const percent = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0;
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-base">{label}</CardTitle>
                    <CardDescription>
                      {current.toLocaleString()} / {limit.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={percent} />
                  </CardContent>
                </Card>
              );
            })
          : Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">Loading…</CardTitle>
                  <CardDescription>Fetching usage summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={0} className="animate-pulse" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </RoleGate>
  );
}

function UsageFallback() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
      <p className="text-sm text-muted-foreground">
        You need OWNER or ADMIN permissions to view usage metrics.
      </p>
    </div>
  );
}
