'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowUpRight, Banknote, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCompactCurrency, formatCurrency, formatRelative } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function OverviewPage() {
  const { data: metrics } = useQuery({ queryKey: ['admin-metrics'], queryFn: api.getMetrics });
  const { data: accounts = [] } = useQuery({ queryKey: ['admin-accounts'], queryFn: api.listAccounts });
  const { data: payouts = [] } = useQuery({ queryKey: ['admin-payouts'], queryFn: api.listPayouts });
  const { data: audit = [] } = useQuery({ queryKey: ['admin-audit'], queryFn: api.listAuditLog });

  const atRisk = accounts.filter((account) => ['PAST_DUE', 'TRIALING'].includes(account.status));
  const payoutStatuses = {
    paid: { label: 'Paid', variant: 'secondary' },
    pending: { label: 'Pending', variant: 'outline' },
    failed: { label: 'Failed', variant: 'destructive' }
  } as const;
  const severityCopy = {
    high: { label: 'High', variant: 'destructive' },
    medium: { label: 'Medium', variant: 'secondary' },
    low: { label: 'Low', variant: 'outline' }
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operator overview</h1>
          <p className="text-sm text-muted-foreground">
            Revenue health, escalations, and platform status at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/plans">Adjust plan pricing</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Monthly recurring revenue"
          description="Live MRR including trials"
          value={metrics ? formatCurrency(metrics.mrrUsd) : '—'}
          icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Annual run rate"
          description="Projected ARR"
          value={metrics ? formatCompactCurrency(metrics.arrUsd) : '—'}
          icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active accounts"
          description={`${metrics?.ticketsOpen ?? '—'} open escalations`}
          value={metrics?.activeAccounts ?? '—'}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Churn rate"
          description="Trailing 30 day"
          value={metrics ? `${metrics.churnRate}%` : '—'}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Accounts requiring attention</CardTitle>
              <CardDescription>Monitor billing risk to keep retention healthy.</CardDescription>
            </div>
            <Badge variant="secondary">{atRisk.length} accounts</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {atRisk.length === 0 ? (
              <p className="text-sm text-muted-foreground">All accounts are healthy right now.</p>
            ) : (
              <ul className="space-y-3">
                {atRisk.map((account) => (
                  <li key={account.id} className="rounded-md border bg-card/40 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{account.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {account.planName} · {formatCurrency(account.mrrUsd)} MRR
                        </p>
                      </div>
                      <Badge variant={account.status === 'PAST_DUE' ? 'destructive' : 'outline'}>
                        {account.status === 'PAST_DUE' ? 'Past due' : 'Trial expiring'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Last invoice {formatRelative(account.lastInvoiceAt)} · {account.seats} seats provisioned
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Latest payouts</CardTitle>
            <CardDescription>Stripe transfers synced hourly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.slice(0, 4).map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{payout.id}</div>
                      <div className="text-xs text-muted-foreground">
                        Initiated {formatRelative(payout.initiatedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payoutStatuses[payout.status].variant}>
                        {payoutStatuses[payout.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(payout.amountUsd)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Latest audit events</CardTitle>
            <CardDescription>High signal actions for compliance review.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/audit-log">View audit log</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.slice(0, 5).map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium text-foreground">{event.action}</TableCell>
                  <TableCell>{event.actor}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{event.target}</TableCell>
                  <TableCell>
                    <Badge variant={severityCopy[event.severity].variant}>
                      {severityCopy[event.severity].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatRelative(event.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  description,
  value,
  icon
}: {
  title: string;
  description: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
