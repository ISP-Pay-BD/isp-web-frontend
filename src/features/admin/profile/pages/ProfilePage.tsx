'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Lock, Shield } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { adminProfileData } from '@/data/admin/profile.data';

export function ProfilePage() {
  const [profile, setProfile] = useState(adminProfileData);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.next) {
      toast.error('Fill in all password fields');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setPasswords({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your admin account details and security"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Profile' }]}
      />

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">{profile.avatarInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.email} · {profile.role}</p>
          <p className="text-xs text-muted-foreground">Last login: {formatDateTime(profile.lastLogin)}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="password" className="gap-1.5"><Lock className="h-3.5 w-3.5" />Change Password</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="text-base">Account Information</CardTitle><CardDescription>Update your contact details</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Username</Label><Input value={profile.username} readOnly className="bg-muted" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
              <div className="md:col-span-2"><Button onClick={handleSaveProfile}>Save Profile</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent className="max-w-md space-y-4">
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} /></div>
              <div className="space-y-2"><Label>New Password</Label><Input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} /></div>
              <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
              <Button onClick={handleChangePassword}>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="text-base">Two-Factor Authentication</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable 2FA</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your admin account</p>
              </div>
              <Switch checked={profile.twoFactorEnabled} onCheckedChange={(v) => { setProfile({ ...profile, twoFactorEnabled: v }); toast.success(v ? '2FA enabled' : '2FA disabled'); }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
