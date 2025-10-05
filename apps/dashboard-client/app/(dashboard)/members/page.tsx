'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { memberInviteSchema } from '@/lib/schemas';
import { RoleGate } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

const roles = ['OWNER', 'ADMIN', 'VIEWER'] as const;

type InviteState = {
  email: string;
  role: (typeof roles)[number];
};

const defaultInvite: InviteState = {
  email: '',
  role: 'VIEWER'
};

export default function MembersPage() {
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: api.listMembers
  });

  const [success, setSuccess] = useState<string | null>(null);
  const form = useForm<InviteState>({
    resolver: zodResolver(memberInviteSchema),
    defaultValues: defaultInvite
  });

  const onSubmit = form.handleSubmit((values) => {
    setSuccess(`Invite ready to send to ${values.email} as ${values.role}. Integrate EmailPort next.`);
    form.reset(defaultInvite);
  });

  useEffect(() => {
    const subscription = form.watch(() => setSuccess(null));
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <RoleGate allowed={['OWNER', 'ADMIN']} fallback={<MembersFallback />}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">Manage seats and send new invites.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      Invite your first teammate to collaborate on feedback triage.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {member.role}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <h2 className="text-lg font-semibold">Invite member</h2>
                <p className="text-sm text-muted-foreground">
                  Sends a magic link that provisions access after verification.
                </p>
              </div>
              <label className="space-y-2 text-sm font-medium">
                <span>Email</span>
                <Input type="email" {...form.register('email')} required />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Role</span>
                <select
                  className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...form.register('role')}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {form.formState.errors.role && (
                  <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
                )}
              </label>
              {success && (
                <p className="rounded-md border border-primary bg-primary/10 p-3 text-sm text-primary">{success}</p>
              )}
              <Button className="w-full" type="submit">
                Send invite
              </Button>
            </form>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}

function MembersFallback() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
      <p className="text-sm text-muted-foreground">
        You need OWNER or ADMIN permissions to manage workspace members.
      </p>
    </div>
  );
}
