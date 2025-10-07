'use client';

import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelative } from '@/lib/format';
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

export default function OperatorsPage() {
  const { data: operators = [] } = useQuery({ queryKey: ['admin-operators'], queryFn: api.listOperators });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operators</h1>
          <p className="text-sm text-muted-foreground">
            Manage who inside Bugsy can access financial, support, and security tools.
          </p>
        </div>
        <Button size="sm" onClick={() => console.log('invite operator')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite operator
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team directory</CardTitle>
          <CardDescription>Revocations sync instantly with auth provider.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Last active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell className="font-medium text-foreground">{operator.name}</TableCell>
                  <TableCell className="text-muted-foreground">{operator.email}</TableCell>
                  <TableCell>{operator.account}</TableCell>
                  <TableCell>
                    <Badge variant={operator.role === 'OWNER' ? 'secondary' : 'outline'}>
                      {operator.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatRelative(operator.lastSeenAt)}
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
