'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LifeBuoy,
  Send,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerPageShell } from '@/features/customer/shared';
import { useCreateTicket } from '../hooks/use-customer-support';
import { createTicketSchema, type CreateTicketInput } from '@/features/customer/shared';
import { toast } from 'sonner';

const categories = [
  'Internet Slow / Speed Drop',
  'Fiber Cable Cut / Physical Line Down',
  'Frequent Disconnections',
  'Billing / Payment Not Reflected',
  'Router / WiFi Password Change Request',
  'Package Upgrade Inquiry',
  'Optical Signal / Red LOS Light on ONT',
  'Other Inquiry',
];

export function CustomerNewTicketPage() {
  const router = useRouter();
  const createMutation = useCreateTicket();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      category: categories[0],
      priority: 'medium',
      subject: '',
      message: '',
    },
  });

  const selectedPriority = watch('priority');

  const onSubmit = async (data: CreateTicketInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Support ticket created successfully! Our team will get back shortly.');
      router.push('/customer/support');
    } catch {
      toast.error('Failed to submit ticket. Please check fields and retry.');
    }
  };

  return (
    <CustomerPageShell
      title="Create Support Ticket"
      subtitle="Report an issue to your ISP technical support desk and track progress."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Support', href: '/customer/support' },
        { label: 'New Ticket' },
      ]}
      actions={
        <Link href="/customer/support">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-primary" />
                Ticket Information
              </CardTitle>
              <CardDescription className="text-xs">
                Provide specific details to help our network NOC technicians diagnose your issue quickly.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category">Issue Category</Label>
                <Select
                  defaultValue={categories[0]}
                  onValueChange={(val) => {
                    if (val) setValue('category', val);
                  }}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <Label>Priority Level</Label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={selectedPriority === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValue('priority', p)}
                      className={`capitalize font-bold text-xs ${
                        selectedPriority === p && p === 'high'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : ''
                      }`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject Summary</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Internet speed drops after 8 PM every evening"
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">{errors.subject.message}</p>
                )}
              </div>

              {/* Description Body */}
              <div className="space-y-1.5">
                <Label htmlFor="message">Detailed Description</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Please describe what happens, when it started, and whether router restart resolves it..."
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-xs text-destructive">{errors.message.message}</p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2.5 text-xs text-muted-foreground border">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  Tip: If your ONT router exhibits a <strong>Red LOS</strong> light, please inspect if the yellow optical patch cord is bent or detached before submitting.
                </span>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <Link href="/customer/support">
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="font-bold gap-2 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  {createMutation.isPending ? 'Submitting...' : 'Submit Support Ticket'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </CustomerPageShell>
  );
}
