'use client';

import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId ?? ''),
    enabled: Boolean(projectId)
  });

  const { data: snippet } = useQuery({
    queryKey: ['project-snippet', projectId],
    queryFn: () => api.getProjectSnippet(projectId ?? ''),
    enabled: Boolean(projectId)
  });

  if (!projectId) {
    notFound();
  }

  if (!isLoading && !project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project?.name ?? 'Loading…'}</h1>
          <p className="text-sm text-muted-foreground">{project?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Rotate keys</Button>
          <Button variant="secondary">Pause project</Button>
          <Button>Save changes</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API keys</CardTitle>
            <CardDescription>Use these keys when integrating the widget and API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Public key" value={project?.publicKey ?? '…'} />
            <InfoRow label="Secret key" value={project?.secretKey ?? '…'} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Widget defaults</CardTitle>
            <CardDescription>Current settings provided to the embed runtime.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Status" value={project?.status ?? '…'} />
            <InfoRow
              label="Created"
              value={project ? format(project.createdAt, 'MMM d, yyyy') : '…'}
            />
            <InfoRow label="Theme" value={project?.widget.theme ?? 'auto'} />
            <InfoRow label="Position" value={project?.widget.position ?? 'right'} />
            <InfoRow
              label="Screenshot"
              value={
                project?.widget.screenshot.enabled === undefined
                  ? '…'
                  : project.widget.screenshot.enabled
                    ? 'Enabled'
                    : 'Disabled'
              }
            />
            <InfoRow label="Captcha" value={project?.widget.captcha.provider ?? 'none'} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Authorized domains</CardTitle>
            <CardDescription>Requests must originate from these hostnames.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {project?.authorizedDomains?.map((domain) => (
              <Badge key={domain} variant="outline">
                {domain}
              </Badge>
            )) || <p className="text-sm text-muted-foreground">Loading domains…</p>}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Embed snippet</CardTitle>
            <CardDescription>Copy and paste this snippet into your host page.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-md border bg-muted/40 p-4 text-xs text-muted-foreground">
              {snippet?.embedSnippet ?? 'Loading snippet…'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
