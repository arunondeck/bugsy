'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useSession } from '@/lib/auth';
import { mainNav, secondaryNav } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const session = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 border-r bg-card/50 px-4 py-6 xl:block">
        <div className="mb-8">
          <p className="text-xs uppercase text-muted-foreground">Operator</p>
          <p className="font-semibold text-foreground">{session.name}</p>
          <p className="text-sm text-muted-foreground">{session.email}</p>
          <p className="text-xs text-muted-foreground">
            Permissions: {session.permissions.join(', ')}
          </p>
        </div>
        <nav className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Control</p>
            <ul className="space-y-1">
              {mainNav.map((item) => {
                const canSee = item.permissions.some((permission) =>
                  session.permissions.includes(permission)
                );
                if (!canSee) {
                  return null;
                }
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Operations</p>
            <ul className="space-y-1">
              {secondaryNav.map((item) => {
                const canSee = item.permissions.some((permission) =>
                  session.permissions.includes(permission)
                );
                if (!canSee) {
                  return null;
                }
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>
      <main className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Environment</p>
              <p className="font-semibold text-foreground">Sandbox</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="ml-2">Switch theme</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => console.log('sign out')}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </header>
        <div className="flex-1 px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
