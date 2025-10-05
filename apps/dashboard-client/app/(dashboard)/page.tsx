'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardHomePage() {
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: api.listProjects });
  const { data: feedback = [] } = useQuery({ queryKey: ['feedback'], queryFn: () => api.listFeedback() });
  const { data: usage } = useQuery({ queryKey: ['usage', 'summary'], queryFn: api.getUsageSummary });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            High-level glance at submissions and project health.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">Launch new widget</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Projects" description="Active installs across products" value={projects.length} />
        <StatCard
          title="Submissions (month)"
          description={`Quota ${usage?.quota?.submissions ?? '—'}`}
          value={usage?.submissions ?? '…'}
        />
        <StatCard title="Feedback" description="Total inbox rows" value={feedback.length} />
      </div>
    </div>
  );
}

function StatCard({
  title,
  description,
  value
}: {
  title: string;
  description: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
