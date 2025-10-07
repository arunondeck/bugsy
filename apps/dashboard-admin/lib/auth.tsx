'use client';

import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';
import { api } from '@/lib/api';
import { AdminPermission, AdminSession } from '@/lib/schemas';

const AuthContext = createContext<AdminSession | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ['admin-session'],
    queryFn: api.getSession,
    staleTime: 5 * 60 * 1000
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading operator console…</p>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-sm rounded-md border bg-card p-6 text-center">
          <p className="text-base font-semibold text-foreground">Unable to load admin session</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Refresh the page or verify your admin access token to continue.
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

export function useHasPermission(required: AdminPermission | AdminPermission[]) {
  const session = useSession();
  const requiredPermissions = Array.isArray(required) ? required : [required];
  return requiredPermissions.some((permission) => session.permissions.includes(permission));
}

export function PermissionGate({
  allow,
  fallback,
  children
}: {
  allow: AdminPermission | AdminPermission[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const hasPermission = useHasPermission(allow);
  if (!hasPermission) {
    return fallback ?? null;
  }
  return <>{children}</>;
}
