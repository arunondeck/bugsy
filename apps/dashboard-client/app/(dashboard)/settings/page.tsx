'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleGate } from '@/lib/auth';

type SettingsValues = {
  name: string;
  notificationEmail: string;
  weeklyDigest: boolean;
};

const initialValues: SettingsValues = {
  name: 'Acme Inc.',
  notificationEmail: 'product@acme.test',
  weeklyDigest: true
};

export default function SettingsPage() {
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialValues
  });
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = form.handleSubmit((values) => {
    const result = settingsSchema.safeParse(values);
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path[0];
      if (typeof field === 'string') {
        form.setError(field as keyof SettingsValues, { message: issue.message });
        setMessage(null);
      } else {
        setMessage(issue.message);
      }
      return;
    }

    setMessage('Settings validated. Wire RepoPort.updateAccount to persist changes.');
  });

  const digestEnabled = form.watch('weeklyDigest');

  useEffect(() => {
    const subscription = form.watch(() => setMessage(null));
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <RoleGate allowed={['OWNER', 'ADMIN']} fallback={<SettingsFallback />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
          <p className="text-sm text-muted-foreground">Manage account profile and notification rules.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>These details appear in invoices and workspace headers.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <label className="space-y-2 text-sm font-medium">
                <span>Account name</span>
                <Input {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Notification email</span>
                <Input type="email" {...form.register('notificationEmail')} />
                {form.formState.errors.notificationEmail && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.notificationEmail.message}
                  </p>
                )}
              </label>
              <label className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <p className="font-medium">Weekly digest</p>
                  <p className="text-xs text-muted-foreground">Send a summary of new feedback every Monday.</p>
                </div>
                <Switch
                  checked={digestEnabled}
                  onCheckedChange={(checked) => form.setValue('weeklyDigest', checked === true)}
                />
              </label>
              {message && (
                <p className="rounded-md border border-primary bg-primary/10 p-3 text-sm text-primary">{message}</p>
              )}
              <div className="flex justify-end">
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}

function SettingsFallback() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
      <p className="text-sm text-muted-foreground">
        Only owners and admins can update account settings.
      </p>
    </div>
  );
}
