'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wifi,
  Users,
  Package,
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  Zap,
  Activity,
} from 'lucide-react';
import { formatBdtWithSymbol } from '@/lib/format';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const QUICK_LINKS = [
  {
    href: '/admin/hotspot/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    desc: 'Live sessions and revenue KPIs',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    hoverColor: 'group-hover:bg-blue-500 group-hover:text-white',
  },
  {
    href: '/admin/hotspot/packages',
    label: 'Packages',
    icon: Package,
    desc: 'Hotspot profiles and rate limits',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    hoverColor: 'group-hover:bg-purple-500 group-hover:text-white',
  },
  {
    href: '/admin/hotspot/users',
    label: 'Users',
    icon: Users,
    desc: 'Active vouchers and MAC sessions',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hoverColor: 'group-hover:bg-amber-500 group-hover:text-white',
  },
  {
    href: '/admin/hotspot/reports',
    label: 'Reports',
    icon: BarChart3,
    desc: 'Daily sales by router and cashier',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    hoverColor: 'group-hover:bg-emerald-500 group-hover:text-white',
  },
] as const;

export function HotspotHubPage() {
  const { data, isLoading } = useHotspotData();

  if (isLoading) return <PageSkeleton variant="dashboard" rows={5} />;

  const profiles = data?.profiles ?? [];
  const users = data?.users ?? [];
  const reports = data?.reports ?? [];
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const todaySales = reports
    .filter((r) => r.date === new Date().toISOString().split('T')[0])
    .reduce((s, r) => s + r.priceBdt, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial={false}
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Hotspot Management"
          subtitle="MikroTik hotspot vouchers, cafe/hotel packages, and voucher sales"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Hotspot' },
          ]}
          actions={
            <Link href="/admin/hotspot/packages">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-2xs">
                <Package className="mr-1.5 h-3.5 w-3.5" /> Create Package
              </Button>
            </Link>
          }
        />
      </motion.div>

      {/* KPI Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Profiles"
          value={String(profiles.length)}
          icon={Package}
          description="Hotspot rate profiles"
          trend={{ value: '+2 this month', positive: true }}
          href="/admin/hotspot/packages"
          ctaText="View packages"
        />
        <StatCard
          title="Live Sessions"
          value={String(activeUsers)}
          icon={Wifi}
          description="Currently connected users"
          trend={{ value: 'Real-time from MikroTik', positive: true }}
          href="/admin/hotspot/dashboard"
          ctaText="View dashboard"
        />
        <StatCard
          title="Total Vouchers"
          value={String(users.length)}
          icon={Users}
          description="Active and expired vouchers"
          trend={{ value: `${activeUsers} currently active`, positive: true }}
          href="/admin/hotspot/users"
          ctaText="Manage users"
        />
        <StatCard
          title="Today Sales"
          value={formatBdtWithSymbol(todaySales)}
          icon={BarChart3}
          description="Today's revenue collection"
          trend={{ value: '+18% vs yesterday', positive: true }}
          href="/admin/hotspot/reports"
          ctaText="View reports"
        />
      </motion.div>

      {/* Quick Access Hub */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Quick Access
            </h2>
            <p className="text-xs text-muted-foreground">Navigate to hotspot modules</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="block group no-underline">
              <Card className="transition-all duration-200 hover:border-primary/50 hover:shadow-md group-hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border ${link.color} group-hover:scale-110 transition-transform duration-200`}>
                        <link.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {link.label}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Live Sessions Preview */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/70 bg-card shadow-2xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" /> Live Hotspot Sessions
              </CardTitle>
              <CardDescription className="text-xs">Real-time user connections across all routers</CardDescription>
            </div>
            <Link href="/admin/hotspot/dashboard">
              <Button size="sm" variant="ghost" className="text-xs text-primary">
                View Dashboard <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {users.slice(0, 4).map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-foreground truncate max-w-[120px]">
                      {user.username}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono mb-2">{user.macAddress}</div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{user.profileName}</span>
                    <span className="font-semibold text-foreground">{user.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
