'use client';

import type { CustomUserAccessRecord } from '@/data/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CustomAccessTableProps {
  records: CustomUserAccessRecord[];
  onView?: (record: CustomUserAccessRecord) => void;
}

export function CustomAccessTable({ records, onView }: CustomAccessTableProps) {
  if (records.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No custom access records yet.
      </p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Rules</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.name}</TableCell>
              <TableCell>{record.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{record.role}</Badge>
              </TableCell>
              <TableCell>{record.customRulesCount}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{record.updatedAt}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onView?.(record)}>
                  View rules
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
