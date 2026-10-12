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
import {
  CustomerPageShell,
  createTicketSchema,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type CreateTicketInput,
} from '@/features/customer/shared';
import { useCreateTicket } from '../hooks/use-customer-support';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { toast } from 'sonner';

/** Labels for the backend's `tickets.category` enum values. */
const CATEGORY_LABELS: Record<(typeof TICKET_CATEGORIES)[number], string> = {
  technical: 'Technical / connection problem',
  noc: 'Network outage (NOC)',
  sales: 'Sales / package inquiry',
  marketing: 'Offers & marketing',
  general: 'General / billing',
  none: 'Other',
};

export function CustomerNewTicketPage() {
  const router = useRouter();
  const createMutation = useCreateTicket();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      category: 'technical',
      priority: 'medium',
      subject: '',
      message: '',
    },
  });

  const selectedPriority = watch('priority');

  const onSubmit = async (data: CreateTicketInput) => {
    try {
      const res = await createMutation.mutateAsync(data);
      toast.success('Support ticket opened. Your provider will reply here.');
      router.push(res?.id ? `/customer/support/${res.id}` : '/customer/support');
    } catch (err) {
      handleApiError(err, setError);
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
                Provide specific details so your provider can diagnose the issue quickly.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category">Issue Category</Label>
                <Select
                  items={CATEGORY_LABELS}
                  defaultValue="technical"
                  onValueChange={(val) => {
                    if (val) setValue('category', val as CreateTicketInput['category']);
                  }}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
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
                  {TICKET_PRIORITIES.map((p) => (
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
