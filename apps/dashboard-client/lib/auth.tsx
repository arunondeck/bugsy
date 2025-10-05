'use client';

import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';
import { api } from '@/lib/api';
import { DashboardSession } from '@/lib/domain';

export type Role = DashboardSession['roles'][number];

const AuthContext = createContext<DashboardSession | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: api.getSession,
    staleTime: 5 * 60 * 1000
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading workspace…</p>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-sm rounded-md border bg-card p-6 text-center">
          <p className="text-base font-semibold text-foreground">Unable to load session</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Refresh the page to retry. If the issue persists, confirm your authentication token is valid.
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={query.data}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const session = useContext(AuthContext);
  if (!session) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return session;
}

export function useHasRole(required: Role | Role[]) {
  const session = useSession();
  const requiredRoles = Array.isArray(required) ? required : [required];
  return requiredRoles.some((role) => session.roles.includes(role));
}

export function RoleGate({
  allowed,
  fallback,
  children
}: {
  allowed: Role | Role[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const hasRole = useHasRole(allowed);
  if (!hasRole) {
    return fallback ?? null;
  }
  return <>{children}</>;
}
