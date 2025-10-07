import { format, formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatCompactCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
}

export function formatDate(timestamp: number) {
  return format(timestamp, 'MMM d, yyyy');
}

export function formatRelative(timestamp: number) {
  return formatDistanceToNow(timestamp, { addSuffix: true });
}
