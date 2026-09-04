'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Network, Calendar } from 'lucide-react';
import { customerSchema, type CustomerFormValues } from '../schemas/customer.schema';
import { useCreateCustomer } from '../hooks/use-customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NewCustomerPage() {
  const router = useRouter();
  const createMutation = useCreateCustomer();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as Resolver<CustomerFormValues>,
    defaultValues: {
      name: '',
      username: '',
      phone: '',
      email: '',
      packageId: 'pkg_10',
      packageName: 'Home 10 Mbps',
      areaId: 'area_uttara',
      areaName: 'Uttara',
      connectionType: 'pppoe',
      password: '1234password',
      macAddress: '00:1A:2B:3C:4D:5E',
      ipAddress: '103.15.20.101',
      balanceBdt: 0,
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'active',
      notes: '',
    },
  });

  const onSubmit = async (values: CustomerFormValues) => {
    const pkgMap: Record<string, string> = {
      pkg_5: 'Home 5 Mbps',
      pkg_10: 'Home 10 Mbps',
      pkg_20: 'Home 20 Mbps',
      pkg_30: 'Home 30 Mbps',
      pkg_50: 'Home 50 Mbps',
    };
    const areaMap: Record<string, string> = {
      area_uttara: 'Uttara',
      area_mirpur: 'Mirpur',
      area_dhanmondi: 'Dhanmondi',
      area_chittagong: 'Chittagong',
    };

    await createMutation.mutateAsync({
      ...values,
      packageName: pkgMap[values.packageId] || 'Home 10 Mbps',
      areaName: areaMap[values.areaId] || 'Uttara',
    });
    router.push('/admin/customers');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHero className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Customer</h1>
            <p className="text-muted-foreground text-sm">
              Provision internet line, router credentials, and package plan.
            </p>
          </div>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Personal Information
            </CardTitle>
            <CardDescription>Subscriber identity and contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="e.g. Rahim Uddin" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input id="phone" placeholder="017XXXXXXXX" {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="subscriber@domain.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="areaId">Service Area *</Label>
              <Select
                value={watch('areaId')}
                onValueChange={(val) => { if (val) setValue('areaId', val); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area_uttara">Uttara</SelectItem>
                  <SelectItem value="area_mirpur">Mirpur</SelectItem>
                  <SelectItem value="area_dhanmondi">Dhanmondi</SelectItem>
                  <SelectItem value="area_chittagong">Chittagong</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Network & Package Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" /> Package & Network Access
            </CardTitle>
            <CardDescription>Plan allocation and PPPoE/Radius credentials</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="packageId">Broadband Package *</Label>
              <Select
                value={watch('packageId')}
                onValueChange={(val) => { if (val) setValue('packageId', val); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pkg_5">Home 5 Mbps — ৳500/mo</SelectItem>
                  <SelectItem value="pkg_10">Home 10 Mbps — ৳800/mo</SelectItem>
                  <SelectItem value="pkg_20">Home 20 Mbps — ৳1,200/mo</SelectItem>
                  <SelectItem value="pkg_30">Home 30 Mbps — ৳1,500/mo</SelectItem>
                  <SelectItem value="pkg_50">Home 50 Mbps — ৳2,200/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="connectionType">Protocol *</Label>
              <Select
                value={watch('connectionType')}
                onValueChange={(val) => { if (val) setValue('connectionType', val as 'pppoe' | 'hotspot' | 'static'); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pppoe">PPPoE Dial-up</SelectItem>
                  <SelectItem value="static">Static IP Routing</SelectItem>
                  <SelectItem value="hotspot">Hotspot Captive Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">PPPoE / Router Username *</Label>
              <Input id="username" placeholder="e.g. user_uttara_101" {...register('username')} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Connection Password</Label>
              <Input id="password" type="password" {...register('password')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="macAddress">MAC Address Binding</Label>
              <Input id="macAddress" placeholder="AA:BB:CC:DD:EE:FF" {...register('macAddress')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ipAddress">Static / Framed IP</Label>
              <Input id="ipAddress" placeholder="103.15.20.XXX" {...register('ipAddress')} />
            </div>
          </CardContent>
        </Card>

        {/* Billing Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Initial Billing & Expiry
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="expiryDate">Cycle Expiry Date *</Label>
              <Input id="expiryDate" type="date" {...register('expiryDate')} />
              {errors.expiryDate && <p className="text-xs text-destructive">{errors.expiryDate.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="balanceBdt">Opening Balance (৳)</Label>
              <Input id="balanceBdt" type="number" {...register('balanceBdt')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/customers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || createMutation.isPending} className="bg-primary hover:bg-primary/90">
            <Save className="mr-1.5 h-4 w-4" /> Save Customer
          </Button>
        </div>
      </form>
    
      </PageContent>
    </div>
  );
}
