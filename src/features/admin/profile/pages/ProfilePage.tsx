'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  User,
  Lock,
  Shield,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Smartphone,
  Laptop,
  Globe,
  Key,
  Eye,
  EyeOff,
  IdCard,
  LogOut,
  Activity,
  Fingerprint,
  Settings,
} from 'lucide-react';
import { adminProfileData } from '@/data/admin/profile.data';

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

const tabContentVariants: Variants = {
  enter: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

const tabs = [
  { id: 'overview', label: 'Profile Overview', icon: User },
  { id: 'edit', label: 'Update Details', icon: Edit3 },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function ProfilePage() {
  const [profile, setProfile] = useState(adminProfileData);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());

  // Password state
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Active sessions state
  const [sessions, setSessions] = useState(adminProfileData.activeSessions);

  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current.get(activeTab);
    const container = tabsRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleTabChange = (id: TabId) => {
    setActiveTab(id);
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next) {
      toast.error('Please enter current and new password');
      return;
    }
    if (passwords.next.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPasswords({ current: '', next: '', confirm: '' });
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.info('Session revoked successfully');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial={false}
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="My Profile"
          subtitle="Manage your administrator account details, security credentials, and active sessions"
          breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Profile' }]}
        />
      </motion.div>

      {/* Hero Header Profile Card */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-border/70 bg-card shadow-2xs">
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
          
          <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar with Presence Ring */}
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary/30 shadow-lg ring-4 ring-background group-hover:ring-primary/20 transition-all duration-300">
                  <AvatarFallback className="text-3xl font-black bg-gradient-to-br from-primary/25 to-primary/10 text-primary">
                    {profile.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 ring-3 ring-background shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                  title="Account is Active & Online"
                />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Edit3 className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>

              {/* Identity & Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    {profile.name}
                  </h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                    <Shield className="mr-1 h-3 w-3" /> {profile.role}
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground font-medium">
                  {profile.designation} · <span className="font-semibold text-foreground">{profile.companyName}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {profile.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" /> {profile.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Joined Jan 2025
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Last active: Today
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
              <Button
                size="sm"
                variant={activeTab === 'edit' ? 'default' : 'outline'}
                onClick={() => handleTabChange('edit')}
                className="text-xs font-semibold shadow-2xs"
              >
                <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'password' ? 'default' : 'outline'}
                onClick={() => handleTabChange('password')}
                className="text-xs font-semibold shadow-2xs"
              >
                <Key className="mr-1.5 h-3.5 w-3.5" /> Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Premium Animated Tabs */}
      <motion.div variants={itemVariants}>
        <div className="space-y-6">
          {/* Tab Triggers with Sliding Indicator */}
          <div
            ref={tabsRef}
            className="relative flex items-center bg-card/80 backdrop-blur-sm border border-border/60 p-1.5 rounded-2xl shadow-sm"
          >
            {/* Sliding Background Indicator */}
            <motion.div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-primary via-primary to-primary/90 shadow-lg shadow-primary/25"
              initial={false}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 30,
                mass: 0.8,
              }}
            />

            {/* Tab Buttons */}
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    if (el) tabRefs.current.set(tab.id, el);
                  }}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative z-10 flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold
                    transition-colors duration-200 ease-out cursor-pointer select-none
                    ${isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }
                  `}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Animated Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Tab 1: Profile Overview */}
              {activeTab === 'overview' && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Contact & Personal Data */}
                  <Card className="border-border/70 shadow-2xs overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <User className="h-4 w-4" />
                        </div>
                        Personal & Contact Info
                      </CardTitle>
                      <CardDescription className="text-xs">Your verified profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <User className="h-3.5 w-3.5 text-primary" /> Full Name
                        </span>
                        <span className="font-bold text-foreground">{profile.name}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <Fingerprint className="h-3.5 w-3.5 text-primary" /> Username
                        </span>
                        <span className="font-mono font-semibold text-foreground">{profile.username}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                        </span>
                        <span className="font-mono text-foreground">{profile.email}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <Phone className="h-3.5 w-3.5 text-primary" /> Primary Phone
                        </span>
                        <span className="font-mono font-semibold text-foreground">{profile.phone}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Alternate Phone
                        </span>
                        <span className="font-mono text-foreground">{profile.alternatePhone}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <IdCard className="h-3.5 w-3.5 text-primary" /> National ID (NID)
                        </span>
                        <span className="font-mono font-bold text-foreground">{profile.nid}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Organization & Location Data */}
                  <Card className="border-border/70 shadow-2xs overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-500/50" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Building className="h-4 w-4" />
                        </div>
                        Organization & Coverage
                      </CardTitle>
                      <CardDescription className="text-xs">Network operations territory</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-emerald-500/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <Building className="h-3.5 w-3.5 text-emerald-500" /> ISP Organization
                        </span>
                        <span className="font-bold text-foreground">{profile.companyName}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-emerald-500/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Access Role
                        </span>
                        <span className="font-semibold text-foreground">{profile.role}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-emerald-500/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Base POP Zone
                        </span>
                        <span className="font-bold text-foreground">{profile.area}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-emerald-500/30 hover:bg-muted/50 transition-all space-y-1">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Office Address
                        </span>
                        <p className="font-medium text-foreground leading-relaxed pt-1">{profile.address}</p>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-emerald-500/30 hover:bg-muted/50 transition-all">
                        <span className="text-muted-foreground flex items-center gap-2.5">
                          <Globe className="h-3.5 w-3.5 text-emerald-500" /> Portal License
                        </span>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Unlimited Super Admin
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tab 2: Edit Profile */}
              {activeTab === 'edit' && (
                <Card className="border-border/70 shadow-2xs overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <Settings className="h-4 w-4" />
                      </div>
                      Update Account Information
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Modify contact credentials and personal details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Section 1: Identification */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Fingerprint className="h-3.5 w-3.5" /> Identity Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Full Name</Label>
                          <Input
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="text-xs h-10 bg-muted/30 border-border/60 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Username (Read-Only)</Label>
                          <Input value={profile.username} readOnly className="bg-muted/50 font-mono text-xs h-10 border-border/60" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">National ID (NID)</Label>
                          <Input
                            value={profile.nid}
                            onChange={(e) => setProfile({ ...profile, nid: e.target.value })}
                            className="font-mono text-xs h-10 bg-muted/30 border-border/60 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Contact Channels */}
                    <div className="pt-4 border-t border-border/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" /> Communication Channels
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Email Address</Label>
                          <Input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="text-xs h-10 font-mono bg-muted/30 border-border/60 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Primary Phone</Label>
                          <Input
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="text-xs h-10 font-mono bg-muted/30 border-border/60 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Alternate Phone</Label>
                          <Input
                            value={profile.alternatePhone}
                            onChange={(e) => setProfile({ ...profile, alternatePhone: e.target.value })}
                            className="text-xs h-10 font-mono bg-muted/30 border-border/60 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Office Address */}
                    <div className="pt-4 border-t border-border/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> Location & Organization
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Service POP / Zone</Label>
                          <Input
                            value={profile.area}
                            onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                            className="text-xs h-10 bg-muted/30 border-border/60 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Company / ISP Name</Label>
                          <Input
                            value={profile.companyName}
                            onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                            className="text-xs h-10 bg-muted/30 border-border/60 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label className="text-xs font-semibold">Detailed Address</Label>
                          <Input
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            className="text-xs h-10 bg-muted/30 border-border/60 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button onClick={handleSaveProfile} className="text-xs font-semibold px-8 shadow-2xs">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tab 3: Change Password */}
              {activeTab === 'password' && (
                <Card className="max-w-2xl border-border/70 shadow-2xs overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-500/50" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Lock className="h-4 w-4" />
                      </div>
                      Update Password
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ensure your account stays secure with a strong password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showCurrent ? 'text' : 'password'}
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            className="text-xs h-11 pr-10 font-mono bg-muted/30 border-border/60 focus:border-amber-500"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNext ? 'text' : 'password'}
                            value={passwords.next}
                            onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                            className="text-xs h-11 pr-10 font-mono bg-muted/30 border-border/60 focus:border-amber-500"
                            placeholder="Enter minimum 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNext(!showNext)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            type={showConfirm ? 'text' : 'password'}
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="text-xs h-11 pr-10 font-mono bg-muted/30 border-border/60 focus:border-amber-500"
                            placeholder="Repeat new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-3">
                        <Button type="submit" className="text-xs font-semibold px-8 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs">
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Tab 4: Security & Active Sessions */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* 2FA Card */}
                  <Card className="border-border/70 shadow-2xs overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-500/50" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        Two-Factor Authentication (2FA)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Protect your admin dashboard login with TOTP authenticator verification.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-muted/20">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-500" /> Google Authenticator / Authy
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Require a 6-digit verification code when logging into the ISP operations console.
                        </p>
                      </div>
                      <Switch
                        checked={profile.twoFactorEnabled}
                        onCheckedChange={(v) => {
                          setProfile({ ...profile, twoFactorEnabled: v });
                          toast.success(v ? '2FA enabled successfully' : '2FA disabled');
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Active Sessions List */}
                  <Card className="border-border/70 shadow-2xs overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-500/50" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Laptop className="h-4 w-4" />
                          </div>
                          Active Login Sessions
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSessions(sessions.filter((s) => s.current));
                            toast.success('All other sessions terminated');
                          }}
                          className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <LogOut className="mr-1 h-3 w-3" /> Terminate Other Sessions
                        </Button>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Devices currently logged into this administrator account.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-muted/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                              {sess.device.includes('Mobile') ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-foreground">{sess.device}</span>
                                {sess.current && (
                                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                    Current Device
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                {sess.ip} · {sess.location} · <span className="text-foreground">{sess.lastActive}</span>
                              </div>
                            </div>
                          </div>

                          {!sess.current && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRevokeSession(sess.id)}
                              className="text-xs text-rose-500 hover:bg-rose-500/10"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Security Audit Trail */}
                  <Card className="border-border/70 shadow-2xs overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-500/50" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <Clock className="h-4 w-4" />
                        </div>
                        Security Audit Events
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Recent authentication and credential modification events.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {profile.securityLog.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10 text-xs hover:border-purple-500/30 hover:bg-muted/30 transition-all"
                        >
                          <span className="font-semibold text-foreground flex items-center gap-2.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> {log.action}
                          </span>
                          <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
                            <span>{log.ip}</span>
                            <span>{log.time}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
