'use client';

import { useQuery } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminAccount } from '@/lib/schemas';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
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

const statusCopy: Record<AdminAccount['status'], { label: string; variant: 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Active', variant: 'secondary' },
  TRIALING: { label: 'Trialing', variant: 'outline' },
  PAST_DUE: { label: 'Past due', variant: 'destructive' },
  CANCELED: { label: 'Canceled', variant: 'outline' }
};

export default function AccountsPage() {
  const { data: accounts = [] } = useQuery({ queryKey: ['admin-accounts'], queryFn: api.listAccounts });

  const pastDue = accounts.filter((account) => account.status === 'PAST_DUE');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customer accounts</h1>
          <p className="text-sm text-muted-foreground">
            Full view of paying teams, trial timelines, and billing health.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => console.log('export accounts')}>
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Escalated accounts</CardTitle>
            <CardDescription>Accounts past due or flagged by finance.</CardDescription>
          </div>
          <Badge variant={pastDue.length === 0 ? 'outline' : 'destructive'}>
            {pastDue.length} issues
          </Badge>
        </CardHeader>
        <CardContent>
          {pastDue.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
              Nothing requires intervention right now.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Arrears</TableHead>
                  <TableHead className="text-right">Last invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastDue.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium text-foreground">{account.name}</TableCell>
                    <TableCell>{account.planName}</TableCell>
                    <TableCell>
                      <Badge variant={statusCopy[account.status].variant}>
                        {statusCopy[account.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(account.mrrUsd)}</TableCell>
                    <TableCell>
                      {account.arrearsUsd === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        formatCurrency(account.arrearsUsd)
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatRelative(account.lastInvoiceAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All accounts</CardTitle>
          <CardDescription>Sort by status to triage outreach.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{account.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Last invoice {formatRelative(account.lastInvoiceAt)}
                    </div>
                  </TableCell>
                  <TableCell>{account.planName}</TableCell>
                  <TableCell>
                    <Badge variant={statusCopy[account.status].variant}>
                      {statusCopy[account.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.seats}</TableCell>
                  <TableCell>{formatCurrency(account.mrrUsd)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDate(account.createdAt)}
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
