import type { Route } from 'next';
import type { AdminPermission } from '@/lib/schemas';

export type NavItem = {
  label: string;
  href: Route;
  permissions: AdminPermission[];
};

export const mainNav: NavItem[] = [
  { label: 'Overview', href: '/overview', permissions: ['SUPERADMIN', 'SUPPORT', 'FINANCE'] },
  { label: 'Accounts', href: '/accounts', permissions: ['SUPERADMIN', 'SUPPORT'] },
  { label: 'Plans', href: '/plans', permissions: ['SUPERADMIN', 'FINANCE'] },
  { label: 'Operators', href: '/operators', permissions: ['SUPERADMIN'] },
  { label: 'Payouts', href: '/payouts', permissions: ['SUPERADMIN', 'FINANCE'] }
];

export const secondaryNav: NavItem[] = [
  { label: 'Audit log', href: '/audit-log', permissions: ['SUPERADMIN', 'SUPPORT', 'FINANCE'] },
  { label: 'Integrations', href: '/integrations', permissions: ['SUPERADMIN'] }
];
