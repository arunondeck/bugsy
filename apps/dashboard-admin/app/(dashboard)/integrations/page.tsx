import { CheckCircle, RefreshCcw, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const integrations = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Billing, invoices, subscription management.',
    status: 'connected',
    lastSynced: '3 minutes ago'
  },
  {
    id: 'postmark',
    name: 'Postmark',
    description: 'Transactional email for receipts and alerts.',
    status: 'connected',
    lastSynced: '12 minutes ago'
  },
  {
    id: 's3',
    name: 'S3 / R2',
    description: 'Screenshot & attachment storage.',
    status: 'connected',
    lastSynced: '1 hour ago'
  },
  {
    id: 'datadog',
    name: 'Datadog',
    description: 'Monitoring and anomaly alerts.',
    status: 'pending',
    lastSynced: 'Awaiting API key'
  }
] satisfies Array<{
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'pending';
  lastSynced: string;
}>;

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            Control upstream services powering billing, email, and monitoring.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => console.log('refresh integrations')}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh status
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id} className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">{integration.name}</CardTitle>
                <Badge variant={integration.status === 'connected' ? 'secondary' : 'outline'}>
                  {integration.status === 'connected' ? 'Connected' : 'Pending setup'}
                </Badge>
              </div>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Last sync · {integration.lastSynced}</p>
              <Button size="sm" onClick={() => console.log('configure', integration.id)}>
                {integration.status === 'connected' ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Manage
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete setup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
