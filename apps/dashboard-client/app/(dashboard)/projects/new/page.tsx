'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectCreateSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RoleGate } from '@/lib/auth';

const formSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  domains: z.string().min(1, 'Provide at least one domain'),
  theme: z.enum(['auto', 'light', 'dark']).default('auto'),
  position: z.enum(['right', 'left']).default('right'),
  screenshot: z.boolean().default(true),
  captchaProvider: z.enum(['none', 'turnstile', 'hcaptcha']).default('turnstile'),
  siteKey: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  name: '',
  description: '',
  domains: 'https://example.com',
  theme: 'auto',
  position: 'right',
  screenshot: true,
  captchaProvider: 'turnstile',
  siteKey: ''
};

export default function NewProjectPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      domains: values.domains.split(/\s|,/).filter(Boolean),
      theme: values.theme,
      position: values.position,
      screenshot: values.screenshot,
      captcha: {
        provider: values.captchaProvider,
        siteKey: values.siteKey || undefined
      }
    };

    const result = projectCreateSchema.safeParse(payload);
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = typeof issue.path[0] === 'string' ? (issue.path[0] as keyof FormValues) : undefined;
      if (field) {
        form.setError(field, { message: issue.message });
      }
      setSuccess(null);
      return;
    }

    setSuccess('Project scaffold validated locally. Wire API mutation to persist.');
  });

  const screenshotEnabled = form.watch('screenshot');
  const captchaProvider = form.watch('captchaProvider');

  useEffect(() => {
    const subscription = form.watch(() => setSuccess(null));
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <RoleGate allowed={['OWNER', 'ADMIN']} fallback={<ProjectCreateFallback />}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create project</h1>
          <p className="text-sm text-muted-foreground">
            Configure embed defaults, domain allow lists, and captcha rules before going live.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Widget configuration</CardTitle>
            <CardDescription>Validate your setup prior to persisting via the API adapter.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  <span>Project name</span>
                  <Input placeholder="Marketing site" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>Position</span>
                  <select
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register('position')}
                  >
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                  </select>
                </label>
              </div>
              <label className="space-y-2 text-sm font-medium">
                <span>Description</span>
                <Textarea
                  placeholder="Where will this widget live?"
                  {...form.register('description')}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Allowed domains</span>
                <Textarea
                  placeholder="https://app.example.com"
                  {...form.register('domains')}
                />
                {form.formState.errors.domains && (
                  <p className="text-xs text-destructive">{form.formState.errors.domains.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Separate multiple domains with commas or newlines.</p>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  <span>Theme</span>
                  <select
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register('theme')}
                  >
                    <option value="auto">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
                <label className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div>
                    <p className="font-medium">Screenshots</p>
                    <p className="text-xs text-muted-foreground">Allow reporters to attach browser captures.</p>
                  </div>
                  <Switch
                    checked={screenshotEnabled}
                    onCheckedChange={(checked) => form.setValue('screenshot', checked === true)}
                  />
                </label>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium">Captcha</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    <span>Provider</span>
                    <select
                      className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...form.register('captchaProvider')}
                    >
                      <option value="none">None</option>
                      <option value="turnstile">Turnstile</option>
                      <option value="hcaptcha">hCaptcha</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Site key</span>
                    <Input
                      placeholder="Optional"
                      {...form.register('siteKey')}
                      disabled={captchaProvider === 'none'}
                    />
                  </label>
                </div>
              </div>
              {success && (
                <p className="rounded-md border border-primary bg-primary/10 p-3 text-sm text-primary">{success}</p>
              )}
              <div className="flex justify-end">
                <Button type="submit">Validate configuration</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}

function ProjectCreateFallback() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Create project</h1>
      <p className="text-sm text-muted-foreground">
        Only owners and admins can provision new feedback widgets.
      </p>
    </div>
  );
}
