'use client';

import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { api } from '@/lib/api';
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

export default function PayoutsPage() {
  const { data: payouts = [] } = useQuery({ queryKey: ['admin-payouts'], queryFn: api.listPayouts });
  const statusCopy = {
    paid: { label: 'Paid', variant: 'secondary' },
    pending: { label: 'Pending', variant: 'outline' },
    failed: { label: 'Failed', variant: 'destructive' }
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payouts</h1>
          <p className="text-sm text-muted-foreground">
            Track Stripe transfers, investigate failures, and export settlements.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => console.log('download payouts')}>
          <Download className="mr-2 h-4 w-4" />
          Download report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer history</CardTitle>
          <CardDescription>Amounts are net of processing fees.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Initiated</TableHead>
                <TableHead>Deposited</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium text-foreground">{payout.id}</TableCell>
                  <TableCell>
                    <Badge variant={statusCopy[payout.status].variant}>
                      {statusCopy[payout.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(payout.initiatedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payout.depositedAt ? formatRelative(payout.depositedAt) : '—'}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(payout.amountUsd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
