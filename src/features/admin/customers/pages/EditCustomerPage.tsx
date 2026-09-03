'use client';

import { use, useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Network, Calendar } from 'lucide-react';
import { customerSchema, type CustomerFormValues } from '../schemas/customer.schema';
import { useCustomer, useUpdateCustomer } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EditCustomerPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCustomer(id);
  const updateMutation = useUpdateCustomer(id);

  const customer = data?.customer;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as Resolver<CustomerFormValues>,
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        username: customer.username,
        phone: customer.phone,
        email: customer.email || '',
        packageId: customer.packageId,
        packageName: customer.packageName,
        areaId: customer.areaId,
        areaName: customer.areaName,
        connectionType: customer.connectionType,
        macAddress: customer.macAddress || '',
        ipAddress: customer.ipAddress || '',
        balanceBdt: customer.balanceBdt,
        expiryDate: customer.expiryDate,
        status: customer.status,
      });
    }
  }, [customer, reset]);

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError || !customer) {
    return (
      <EmptyState
        title="Customer not found"
        description="Could not locate subscriber record."
        actionLabel="Back to list"
        onAction={() => router.push('/admin/customers')}
      />
    );
  }

  const onSubmit = async (values: CustomerFormValues) => {
    await updateMutation.mutateAsync(values);
    router.push(`/admin/customers/${id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/admin/customers/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Customer: {customer.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">
            {customer.username} • ID: {customer.id}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Subscriber Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register('email')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Account Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(val) => val && setValue('status', val as 'active' | 'expired' | 'suspended')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" /> Network & Routing
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" disabled className="bg-muted font-mono" {...register('username')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="connectionType">Protocol</Label>
              <Select
                value={watch('connectionType')}
                onValueChange={(val) => val && setValue('connectionType', val as 'pppoe' | 'hotspot' | 'static')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pppoe">PPPoE</SelectItem>
                  <SelectItem value="static">Static IP</SelectItem>
                  <SelectItem value="hotspot">Hotspot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input id="macAddress" className="font-mono" {...register('macAddress')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input id="ipAddress" className="font-mono" {...register('ipAddress')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Cycle & Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input id="expiryDate" type="date" {...register('expiryDate')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="balanceBdt">Balance (৳)</Label>
              <Input id="balanceBdt" type="number" {...register('balanceBdt')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/admin/customers/${id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || updateMutation.isPending} className="bg-primary hover:bg-primary/90">
            <Save className="mr-1.5 h-4 w-4" /> Update Customer
          </Button>
        </div>
      </form>
    </div>
  );
}
