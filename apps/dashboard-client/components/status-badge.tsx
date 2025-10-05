import { Badge } from '@/components/ui/badge';

const palette: Record<string, 'default' | 'secondary' | 'outline'> = {
  NEW: 'default',
  PLANNED: 'secondary',
  IN_PROGRESS: 'secondary',
  DONE: 'outline'
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={palette[status] ?? 'outline'}>{status}</Badge>;
}
