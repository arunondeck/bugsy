import type { Route } from 'next';
import { Role } from '@/lib/auth';

export type NavItem = {
  label: string;
  href: Route;
  roles: Role[];
};

export const mainNav: NavItem[] = [
  { label: 'Projects', href: '/projects', roles: ['OWNER', 'ADMIN', 'VIEWER'] },
  { label: 'Feedback', href: '/feedback', roles: ['OWNER', 'ADMIN', 'VIEWER'] },
  { label: 'Usage', href: '/usage', roles: ['OWNER', 'ADMIN'] },
  { label: 'Members', href: '/members', roles: ['OWNER', 'ADMIN'] },
  { label: 'Billing', href: '/billing', roles: ['OWNER'] },
  { label: 'Settings', href: '/settings', roles: ['OWNER', 'ADMIN'] }
];

export const secondaryNav: NavItem[] = [
  { label: 'Subscribe', href: '/subscribe', roles: ['OWNER'] }
];
