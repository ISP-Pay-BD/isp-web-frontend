'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Edit3,
  Laptop,
  Key,
  Eye,
  EyeOff,
  IdCard,
  LogOut,
  Activity,
  Settings,
  Copy,
} from 'lucide-react';
import { PageSkeleton } from '@/components/shared';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  firstErrorDetail,
  useAdminProfile,
  useChangePassword,
  useDisableTwoFactor,
  useEnableTwoFactor,
  useSecurityOverview,
  useSetupTwoFactor,
  useSignOutOtherDevices,
  useUpdateAdminProfile,
  type AdminProfile,
  type TwoFactorSetup,
} from '../hooks/use-admin-profile';

const tabs = [
  { id: 'overview', label: 'Profile Overview', icon: User },
  { id: 'edit', label: 'Update Details', icon: Edit3 },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
] as const;

type TabId = (typeof tabs)[number]['id'];

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Platform Owner',
  admin: 'ISP Admin',
  resellerAdmin: 'Reseller / POP',
  employee: 'Employee',
};

const fmt = (iso: string | null) => (iso ? new Date(iso.replace(' ', 'T')).toLocaleString() : '—');
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

export function ProfilePage() {
  const { data, isLoading, isError, error, refetch } = useAdminProfile();

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load profile" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  return <ProfilePageInner profile={data} />;
}

function ProfilePageInner({ profile }: { profile: AdminProfile }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;
  const joined = profile.joinedAt ? new Date(profile.joinedAt.replace(' ', 'T')) : null;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="My Profile"
        subtitle="Your account details, password and sign-in security"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Profile' }]}
      />

      <Card className="border-border/70 bg-card shadow-none">
        <CardContent className="relative z-10 flex flex-col justify-between gap-6 p-6 sm:p-8 md:flex-row md:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-20 w-20 border border-border">
              <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">{initials(profile.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{profile.name || '—'}</h2>
                <Badge variant="secondary" className="text-xs font-medium">
                  <Shield className="mr-1 h-3 w-3" /> {roleLabel}
                </Badge>
                {profile.status && (
                  <Badge variant="outline" className="text-xs capitalize text-emerald-700 dark:text-emerald-400">
                    {profile.status}
                  </Badge>
                )}
              </div>
              {profile.organizationName && <p className="text-sm font-semibold text-foreground">{profile.organizationName}</p>}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                {profile.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {profile.email}
                  </span>
                )}
                {profile.mobile && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" /> {profile.mobile}
                  </span>
                )}
                {joined && !Number.isNaN(joined.getTime()) && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Joined{' '}
                    {joined.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <Button size="sm" variant={activeTab === 'edit' ? 'default' : 'outline'} onClick={() => setActiveTab('edit')} className="text-xs font-semibold">
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
            </Button>
            <Button size="sm" variant={activeTab === 'password' ? 'default' : 'outline'} onClick={() => setActiveTab('password')} className="text-xs font-semibold">
              <Key className="mr-1.5 h-3.5 w-3.5" /> Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="relative flex items-center bg-card/80 backdrop-blur-sm border border-border/60 p-1.5 rounded-2xl shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer select-none ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && <OverviewTab profile={profile} roleLabel={roleLabel} />}
        {activeTab === 'edit' && <EditTab profile={profile} />}
        {activeTab === 'password' && <PasswordTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}

function Row({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
      <span className="text-muted-foreground flex items-center gap-2.5">
        {icon} {label}
      </span>
      <span className={`font-semibold text-foreground text-right ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}

function OverviewTab({ profile, roleLabel }: { profile: AdminProfile; roleLabel: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-border/70 shadow-2xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <User className="h-4 w-4" />
            </div>
            Personal & Contact Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <Row icon={<User className="h-3.5 w-3.5 text-primary" />} label="Full Name" value={profile.name} />
          <Row icon={<Mail className="h-3.5 w-3.5 text-primary" />} label="Email" value={profile.email} mono />
          <Row icon={<Phone className="h-3.5 w-3.5 text-primary" />} label="Mobile" value={profile.mobile} mono />
          {profile.whatsapp && <Row icon={<Phone className="h-3.5 w-3.5 text-muted-foreground" />} label="WhatsApp" value={profile.whatsapp} mono />}
          <Row icon={<IdCard className="h-3.5 w-3.5 text-primary" />} label="National ID (NID)" value={profile.nationalId} mono />
        </CardContent>
      </Card>
      <Card className="border-border/70 shadow-2xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Building className="h-4 w-4" />
            </div>
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <Row icon={<Building className="h-3.5 w-3.5 text-emerald-500" />} label="Organization" value={profile.organizationName} />
          <Row icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />} label="Access Role" value={roleLabel} />
          <Row icon={<MapPin className="h-3.5 w-3.5 text-emerald-500" />} label="Division / District" value={[profile.division, profile.district].filter(Boolean).join(', ')} />
          <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1">
            <span className="text-muted-foreground flex items-center gap-2.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Address
            </span>
            <p className="font-medium text-foreground leading-relaxed pt-1">{profile.address || '—'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditTab({ profile }: { profile: AdminProfile }) {
  const [draft, setDraft] = useState<AdminProfile>(profile);
  const update = useUpdateAdminProfile();
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const input = (key: keyof AdminProfile, label: string, opts: { type?: string; mono?: boolean } = {}) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <Input
        type={opts.type ?? 'text'}
        value={String(draft[key] ?? '')}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        className={`text-xs h-10 bg-muted/30 border-border/60 focus:border-primary ${opts.mono ? 'font-mono' : ''}`}
      />
    </div>
  );

  const handleSave = () => {
    if (!draft.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      toast.error('Enter a valid email address');
      return;
    }
    update.mutate({ next: draft, prev: profile }, { onSuccess: () => toast.success('Profile updated') });
  };

  return (
    <Card className="border-border/70 shadow-2xs overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Settings className="h-4 w-4" />
          </div>
          Update Account Information
        </CardTitle>
        <CardDescription className="text-xs">Changes to your email or mobile also change how you sign in.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {input('name', 'Full Name')}
          {input('email', 'Email Address', { type: 'email', mono: true })}
          {input('mobile', 'Mobile', { mono: true })}
        </div>
        <div className="pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-4">
          {input('organizationName', 'Organization / ISP Name')}
          {input('nationalId', 'National ID (NID)', { mono: true })}
          {input('division', 'Division')}
          {input('district', 'District')}
          <div className="md:col-span-2">{input('address', 'Address')}</div>
        </div>
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" disabled={!dirty || update.isPending} onClick={() => setDraft(profile)} className="text-xs">
            Discard
          </Button>
          <Button onClick={handleSave} disabled={!dirty || update.isPending} className="text-xs font-semibold px-8">
            {update.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PasswordTab() {
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const change = useChangePassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next) {
      toast.error('Enter your current and new password');
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
    change.mutate(passwords, {
      onSuccess: () => {
        toast.success('Password updated');
        setPasswords({ current: '', next: '', confirm: '' });
      },
      onError: (err) => toast.error(firstErrorDetail(err)),
    });
  };

  const field = (key: 'current' | 'next' | 'confirm', label: string, placeholder: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <div className="relative">
        <Input
          type={show[key] ? 'text' : 'password'}
          value={passwords[key]}
          autoComplete={key === 'current' ? 'current-password' : 'new-password'}
          onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
          className="text-xs h-11 pr-10 font-mono bg-muted/30 border-border/60 focus:border-amber-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow({ ...show, [key]: !show[key] })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show[key] ? 'Hide password' : 'Show password'}
        >
          {show[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl border-border/70 shadow-2xs overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Lock className="h-4 w-4" />
          </div>
          Update Password
        </CardTitle>
        <CardDescription className="text-xs">Use at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {field('current', 'Current Password', 'Enter current password')}
          {field('next', 'New Password', 'Minimum 8 characters')}
          {field('confirm', 'Confirm New Password', 'Repeat new password')}
          <div className="pt-3">
            <Button type="submit" disabled={change.isPending} className="text-xs font-semibold px-8 bg-amber-600 hover:bg-amber-700 text-white">
              {change.isPending ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  const { data, isLoading, isError, error, refetch } = useSecurityOverview();
  const signOutOthers = useSignOutOtherDevices();
  const setup = useSetupTwoFactor();
  const enable = useEnableTwoFactor();
  const disable = useDisableTwoFactor();
  const [enrolment, setEnrolment] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data) {
    return <EmptyState title="Could not load account security" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const tf = data.twoFactor;

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-2xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            Two-Factor Authentication (TOTP)
          </CardTitle>
          <CardDescription className="text-xs">Link an authenticator app (Google Authenticator, Authy, 1Password…) to this account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-muted/20">
            <div className="space-y-1">
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" /> {tf.enabled ? `Enabled ${tf.confirmedAt ? `since ${fmt(tf.confirmedAt)}` : ''}` : 'Not enabled'}
              </div>
              {tf.enabled && !tf.enforcedAtLogin && (
                <p className="text-xs text-muted-foreground">
                  Your authenticator is linked to this account; sign-in does not ask for a code yet.
                </p>
              )}
            </div>
            <Switch
              checked={tf.enabled}
              disabled={!tf.available || setup.isPending}
              onCheckedChange={(v) => {
                if (v) {
                  setup.mutate(undefined, {
                    onSuccess: (res) => {
                      setCode('');
                      setEnrolment(res);
                    },
                  });
                } else {
                  setDisablePassword('');
                  setDisableOpen(true);
                }
              }}
            />
          </div>
          {!tf.available && <p className="text-xs text-amber-500">Two-factor setup is not available on this server yet.</p>}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Laptop className="h-4 w-4" />
              </div>
              Signed-in Devices
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={signOutOthers.isPending}
              onClick={() => setConfirmSignOut(true)}
              className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="mr-1 h-3 w-3" /> {signOutOthers.isPending ? 'Signing out…' : 'Sign out other devices'}
            </Button>
          </CardTitle>
          <CardDescription className="text-xs">
            Ends every other session (web and app) immediately; this browser stays signed in.
            {data.tokensRevokedAt && ` Last used ${fmt(data.tokensRevokedAt)}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <h4 className="text-xs font-semibold text-muted-foreground">Recent sign-ins</h4>
          {data.loginHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">No sign-ins have been recorded for this account.</p>
          ) : (
            data.loginHistory.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card text-xs">
                <span className="font-semibold text-foreground capitalize">{l.action.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
                  {l.client && <span>{l.client}</span>}
                  {l.ip && <span>{l.ip}</span>}
                  <span>{fmt(l.at)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground border border-border/60">
              <Clock className="h-4 w-4" />
            </div>
            Account Activity
          </CardTitle>
          <CardDescription className="text-xs">Latest actions recorded in the audit log for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.events.length === 0 ? (
            <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
          ) : (
            data.events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10 text-xs">
                <span className="font-semibold text-foreground flex items-center gap-2.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> {ev.action}
                  {ev.entity && <span className="text-muted-foreground font-normal">· {ev.entity}</span>}
                </span>
                <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
                  {ev.ip && <span>{ev.ip}</span>}
                  <span>{fmt(ev.at)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Enrolment */}
      <Dialog open={Boolean(enrolment)} onOpenChange={(open) => !open && setEnrolment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up your authenticator</DialogTitle>
            <DialogDescription>Add this key to your authenticator app (account {enrolment?.account}), then enter the 6-digit code it shows.</DialogDescription>
          </DialogHeader>
          {enrolment && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded-md border border-border/60 bg-muted/40 px-3 py-2 font-mono text-xs tracking-wider">
                  {enrolment.secret.replace(/(.{4})/g, '$1 ').trim()}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Copy key"
                  onClick={() => void navigator.clipboard.writeText(enrolment.secret).then(() => toast.success('Key copied'))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <a href={enrolment.otpauthUri} className="text-xs text-primary hover:underline">
                Open in an authenticator app on this device
              </a>
              <div className="space-y-1.5">
                <Label className="text-xs">6-digit code</Label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="font-mono tracking-[0.4em] text-center"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrolment(null)}>
              Cancel
            </Button>
            <Button
              disabled={code.length !== 6 || enable.isPending}
              onClick={() =>
                enable.mutate(code, {
                  onSuccess: () => {
                    toast.success('Two-factor authentication enabled');
                    setEnrolment(null);
                  },
                  onError: (err) => toast.error(firstErrorDetail(err)),
                })
              }
            >
              {enable.isPending ? 'Verifying…' : 'Verify & enable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Turn off two-factor authentication</DialogTitle>
            <DialogDescription>Confirm with your account password.</DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            autoComplete="current-password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            placeholder="Account password"
            className="text-xs"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!disablePassword || disable.isPending}
              onClick={() =>
                disable.mutate(
                  { password: disablePassword },
                  {
                    onSuccess: () => {
                      toast.success('Two-factor authentication turned off');
                      setDisableOpen(false);
                    },
                    onError: (err) => toast.error(firstErrorDetail(err)),
                  },
                )
              }
            >
              {disable.isPending ? 'Turning off…' : 'Turn off'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmSignOut}
        onOpenChange={setConfirmSignOut}
        title="Sign out other devices?"
        description="Every other browser and app session for your account ends now."
        confirmLabel="Sign out others"
        destructive
        onConfirm={() => {
          setConfirmSignOut(false);
          signOutOthers.mutate(undefined, { onSuccess: () => toast.success('Signed out of all other devices') });
        }}
      />
    </div>
  );
}
