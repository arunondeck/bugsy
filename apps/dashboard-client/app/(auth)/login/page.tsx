import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Log in'
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access your dashboard</CardTitle>
        <CardDescription>Enter your email to receive a magic sign-in link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <label className="space-y-2 text-sm font-medium">
            <span>Email</span>
            <Input type="email" placeholder="you@example.com" required />
          </label>
          <Button className="w-full" type="submit">
            Send magic link
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Trouble signing in?{' '}
            <Link className="underline" href="mailto:support@example.com">
              Contact support
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
