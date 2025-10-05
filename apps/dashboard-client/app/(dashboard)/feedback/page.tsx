'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { feedbackFiltersSchema } from '@/lib/schemas';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';

const statusOptions = ['ALL', 'NEW', 'PLANNED', 'IN_PROGRESS', 'DONE'] as const;

type StatusOption = (typeof statusOptions)[number];

type FilterState = {
  status: StatusOption;
  search: string;
};

const initialFilters: FilterState = {
  status: 'ALL',
  search: ''
};

export default function FeedbackPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.listFeedback()
  });

  const filteredRows = useMemo(() => {
    const parse = feedbackFiltersSchema.safeParse(filters);
    if (!parse.success) {
      return feedback;
    }

    return feedback.filter((row) => {
      const matchesStatus =
        parse.data.status === 'ALL' ? true : row.status === parse.data.status;
      const matchesSearch = parse.data.search
        ? row.title.toLowerCase().includes(parse.data.search.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [feedback, filters]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Review and triage submissions from all connected widgets.
          </p>
        </div>
        <Button variant="outline">Export CSV</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Combine search and status to focus on the next action.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm font-medium">
              <span>Status</span>
              <select
                className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, status: event.target.value as StatusOption }))
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium md:col-span-2">
              <span>Search</span>
              <Input
                placeholder="Search title"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              />
            </label>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Assign status and respond via external tooling.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4}>Loading feedback…</TableCell>
                </TableRow>
              )}
              {!isLoading && filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No feedback matches your filters yet.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                filteredRows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link className="font-medium" href={`/feedback/${item.id}`}>
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      {item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.authorEmail}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
