'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { adminProfileData } from '@/data/admin/profile.data';

export function ProfilePage() {
  const [profile, setProfile] = useState(adminProfileData);
  const [activeTab, setActiveTab] = useState('overview');

  // Password state
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Active sessions state
  const [sessions, setSessions] = useState(adminProfileData.activeSessions);

  const handleSaveProfile = () => {
    toast.success('Admin profile updated successfully');
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="My Profile"
        subtitle="Manage your administrator account details, security credentials, and active sessions"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Profile' }]}
      />

      {/* Hero Header Profile Card */}
      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-r from-card via-card/90 to-primary/5 shadow-xs">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Presence Ring */}
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-primary/40 shadow-md ring-4 ring-background">
                <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-primary/25 to-primary/10 text-primary">
                  {profile.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-background shadow-[0_0_8px_rgba(34,197,94,0.7)]"
                title="Account is Active & Online"
              />
            </div>

            {/* Identity & Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{profile.name}</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                  <Shield className="mr-1 h-3 w-3" /> {profile.role}
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
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
              onClick={() => setActiveTab('edit')}
              className="text-xs font-semibold"
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'password' ? 'default' : 'outline'}
              onClick={() => setActiveTab('password')}
              className="text-xs"
            >
              <Key className="mr-1.5 h-3.5 w-3.5" /> Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border/80 p-1 rounded-xl h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs font-semibold gap-1.5 py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-3.5 w-3.5" /> Profile Overview
          </TabsTrigger>
          <TabsTrigger value="edit" className="text-xs font-semibold gap-1.5 py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Edit3 className="h-3.5 w-3.5" /> Update Details
          </TabsTrigger>
          <TabsTrigger value="password" className="text-xs font-semibold gap-1.5 py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lock className="h-3.5 w-3.5" /> Change Password
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs font-semibold gap-1.5 py-2 px-3.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Security & Sessions
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact & Personal Data */}
            <Card className="border-border/70 shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Personal & Contact Info
                </CardTitle>
                <CardDescription className="text-xs">Your verified profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" /> Full Name
                  </span>
                  <span className="font-bold text-foreground">{profile.name}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-primary" /> Username
                  </span>
                  <span className="font-mono font-semibold text-foreground">{profile.username}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                  </span>
                  <span className="font-mono text-foreground">{profile.email}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary" /> Primary Phone
                  </span>
                  <span className="font-mono font-semibold text-foreground">{profile.phone}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Alternate Phone
                  </span>
                  <span className="font-mono text-foreground">{profile.alternatePhone}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <IdCard className="h-3.5 w-3.5 text-primary" /> National ID (NID)
                  </span>
                  <span className="font-mono font-bold text-foreground">{profile.nid}</span>
                </div>
              </CardContent>
            </Card>

            {/* Organization & Location Data */}
            <Card className="border-border/70 shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" /> Organization & Coverage
                </CardTitle>
                <CardDescription className="text-xs">Network operations territory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-primary" /> ISP Organization
                  </span>
                  <span className="font-bold text-foreground">{profile.companyName}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Access Role
                  </span>
                  <span className="font-semibold text-foreground">{profile.role}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Base POP Zone
                  </span>
                  <span className="font-bold text-foreground">{profile.area}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Office Address
                  </span>
                  <p className="font-medium text-foreground leading-relaxed pt-0.5">{profile.address}</p>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-primary" /> Portal License
                  </span>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Unlimited Super Admin
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Edit Profile */}
        <TabsContent value="edit">
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-primary" /> Update Account Information
              </CardTitle>
              <CardDescription className="text-xs">
                Modify contact credentials and personal details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section 1: Identification */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Identity Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Username (Read-Only)</Label>
                    <Input value={profile.username} readOnly className="bg-muted font-mono text-xs h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">National ID (NID)</Label>
                    <Input
                      value={profile.nid}
                      onChange={(e) => setProfile({ ...profile, nid: e.target.value })}
                      className="font-mono text-xs h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Channels */}
              <div className="pt-2 border-t border-border/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Communication Channels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email Address</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Primary Phone</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Alternate Phone</Label>
                    <Input
                      value={profile.alternatePhone}
                      onChange={(e) => setProfile({ ...profile, alternatePhone: e.target.value })}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Office Address */}
              <div className="pt-2 border-t border-border/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Location & Organization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Service POP / Zone</Label>
                    <Input
                      value={profile.area}
                      onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company / ISP Name</Label>
                    <Input
                      value={profile.companyName}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs">Detailed Address</Label>
                    <Input
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveProfile} className="text-xs font-semibold px-6">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Change Password */}
        <TabsContent value="password">
          <Card className="max-w-2xl border-border/70 shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Update Password
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your account stays secure with a strong password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="text-xs h-9 pr-9 font-mono"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNext ? 'text' : 'password'}
                      value={passwords.next}
                      onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                      className="text-xs h-9 pr-9 font-mono"
                      placeholder="Enter minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNext(!showNext)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="text-xs h-9 pr-9 font-mono"
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="text-xs font-semibold">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Security & Active Sessions */}
        <TabsContent value="security" className="space-y-6">
          {/* 2FA Card */}
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription className="text-xs">
                Protect your admin dashboard login with TOTP authenticator verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="space-y-1">
                <div className="text-sm font-bold text-foreground">Google Authenticator / Authy</div>
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
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-primary" /> Active Login Sessions
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
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
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
          <Card className="border-border/70 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Security Audit Events
              </CardTitle>
              <CardDescription className="text-xs">
                Recent authentication and credential modification events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {profile.securityLog.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10 text-xs"
                >
                  <span className="font-semibold text-foreground flex items-center gap-2">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
