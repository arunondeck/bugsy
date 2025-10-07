'use client';

import { useQuery } from '@tanstack/react-query';
import { Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, formatRelative } from '@/lib/format';
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

export default function AuditLogPage() {
  const { data: events = [] } = useQuery({ queryKey: ['admin-audit'], queryFn: api.listAuditLog });
  const severityCopy = {
    high: { label: 'High', variant: 'destructive' },
    medium: { label: 'Medium', variant: 'secondary' },
    low: { label: 'Low', variant: 'outline' }
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="text-sm text-muted-foreground">
            Immutable record of every configuration change across workspaces.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => console.log('filter audit')}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Export logs to your SIEM for long-term storage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Relative</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium text-foreground">{event.action}</TableCell>
                  <TableCell>{event.actor}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{event.target}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(event.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={severityCopy[event.severity].variant}>
                      {severityCopy[event.severity].label}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">{formatRelative(event.createdAt)}</span>
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
