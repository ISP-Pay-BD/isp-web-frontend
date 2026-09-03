'use client';

import { motion } from 'framer-motion';
import { User, Mail, Shield, FileText, Clock, Eye } from 'lucide-react';
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
import { staggerContainer, fadeUp } from '@/lib/animations';

interface CustomAccessTableProps {
  records: CustomUserAccessRecord[];
  onView?: (record: CustomUserAccessRecord) => void;
}

const ROLE_COLORS: Record<string, string> = {
  resellerAdmin: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  employee: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  admin: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  user: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

export function CustomAccessTable({ records, onView }: CustomAccessTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-2xl bg-muted/30 mb-4">
          <Shield className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">No custom access records yet.</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Users with role-specific overrides will appear here.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="rounded-xl border border-border/60 overflow-hidden"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead>
              <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">User</span>
            </TableHead>
            <TableHead>
              <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Role</span>
            </TableHead>
            <TableHead>
              <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Custom Rules</span>
            </TableHead>
            <TableHead>
              <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Last Updated</span>
            </TableHead>
            <TableHead className="text-right">
              <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, idx) => (
            <motion.tr
              key={record.id}
              variants={fadeUp}
              className="group border-border/40 hover:bg-muted/30 transition-colors"
            >
              <TableCell className="py-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{record.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {record.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium gap-1 ${ROLE_COLORS[record.role] ?? 'bg-muted/50 text-muted-foreground border-border/50'}`}
                >
                  <Shield className="h-2.5 w-2.5" />
                  {record.role}
                </Badge>
              </TableCell>
              <TableCell className="py-3.5">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="font-mono text-sm font-bold text-primary">{record.customRulesCount}</span>
                  <span className="text-[10px] text-muted-foreground">rules</span>
                </div>
              </TableCell>
              <TableCell className="py-3.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-mono">{record.updatedAt}</span>
                </div>
              </TableCell>
              <TableCell className="py-3.5 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView?.(record)}
                  className="gap-1.5 text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View rules
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
