'use client';

import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FeedbackDetailPage() {
  const params = useParams<{ id: string }>();
  const feedbackId = params?.id;

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', feedbackId],
    queryFn: () => api.getFeedback(feedbackId ?? ''),
    enabled: Boolean(feedbackId)
  });

  if (!feedbackId) {
    notFound();
  }

  if (!isLoading && !feedback) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{feedback?.title ?? 'Loading…'}</h1>
          <p className="text-sm text-muted-foreground">Reporter: {feedback?.authorEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          {feedback && <StatusBadge status={feedback.status} />}
          <Button variant="outline">Assign</Button>
          <Button>Update status</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Context and metadata sent from the widget.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h2 className="text-sm font-medium uppercase text-muted-foreground">Tags</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {feedback?.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
          {feedback?.attachments && feedback.attachments.length > 0 && (
            <section>
              <h2 className="text-sm font-medium uppercase text-muted-foreground">Attachments</h2>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {feedback.attachments.map((attachment) => (
                  <li key={attachment.url}>
                    <a className="underline" href={attachment.url} target="_blank" rel="noreferrer">
                      {attachment.kind} – {attachment.url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="text-sm font-medium uppercase text-muted-foreground">Message</h2>
            <p className="mt-2 whitespace-pre-line rounded-md border bg-muted/40 p-4 text-sm">
              {feedback?.body ?? 'No additional details provided.'}
            </p>
          </section>
          <section>
            <h2 className="text-sm font-medium uppercase text-muted-foreground">Context</h2>
            <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
              <Info
                label="Received"
                value={feedback ? new Date(feedback.createdAt).toLocaleString() : '—'}
              />
              <Info label="Page URL" value={feedback?.context?.pageUrl ?? '—'} />
              <Info label="Referrer" value={feedback?.context?.referrer ?? '—'} />
              <Info label="Locale" value={feedback?.context?.locale ?? '—'} />
              <Info label="User agent" value={feedback?.context?.ua ?? '—'} />
              <Info
                label="Viewport"
                value={
                  feedback?.context?.viewport
                    ? `${feedback.context.viewport.w}×${feedback.context.viewport.h}`
                    : '—'
                }
              />
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card px-3 py-2">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
