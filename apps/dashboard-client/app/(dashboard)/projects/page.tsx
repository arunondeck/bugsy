'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: api.listProjects
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Create feedback widgets and manage embed settings across your products.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">New project</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active installs</CardTitle>
          <CardDescription>Track each widget and monitor submission velocity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Submissions (7d)</TableHead>
                <TableHead>Captcha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4}>Loading projects…</TableCell>
                </TableRow>
              )}
              {!isLoading &&
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link className="font-medium" href={`/projects/${project.id}`}>
                        {project.name}
                      </Link>
                      {project.description && (
                        <p className="text-xs text-muted-foreground">{project.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>{format(project.createdAt, 'MMM d, yyyy')}</TableCell>
                    <TableCell>{project.submissionsThisWeek}</TableCell>
                    <TableCell>{project.widget.captcha.provider}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
