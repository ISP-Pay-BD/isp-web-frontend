'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LifeBuoy, Send, ArrowLeft, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CustomerPageShell,
  createTicketSchema,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type CreateTicketInput,
} from '@/features/customer/shared';
import { useCreateTicket } from '../hooks/use-customer-support';
import { ticketCategoryLabel, ticketPriorityLabel } from '../lib/ticket-labels';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { useLocale } from '@/i18n/locale-context';
import { toast } from 'sonner';

export function CustomerNewTicketPage() {
  const { t, te } = useLocale();
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
  const categoryLabels = Object.fromEntries(TICKET_CATEGORIES.map((cat) => [cat, ticketCategoryLabel(t, cat)]));

  const onSubmit = async (data: CreateTicketInput) => {
    try {
      const res = await createMutation.mutateAsync(data);
      toast.success(t('customer.newTicket.created', 'Support ticket opened. Your provider will reply here.'));
      router.push(res?.id ? `/customer/support/${res.id}` : '/customer/support');
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  return (
    <CustomerPageShell
      title={t('customer.newTicket.title', 'Create support ticket')}
      subtitle={t('customer.newTicket.subtitle', 'Report an issue to your ISP technical support desk and track progress.')}
      breadcrumbs={[
        { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
        { label: t('customer.support.crumb', 'Support'), href: '/customer/support' },
        { label: t('customer.newTicket.crumb', 'New ticket') },
      ]}
      actions={
        <Button variant="outline" className="h-11 w-full gap-2 sm:w-auto" render={<Link href="/customer/support" />}>
          <ArrowLeft className="h-4 w-4" />
          {t('customer.newTicket.back', 'Back to tickets')}
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <LifeBuoy className="text-primary h-5 w-5" />
                {t('customer.newTicket.cardTitle', 'Ticket information')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('customer.newTicket.cardDesc', 'Give specific details so your provider can find the problem quickly.')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">{t('customer.newTicket.category', 'Issue category')}</Label>
                <Select
                  items={categoryLabels}
                  defaultValue="technical"
                  onValueChange={(val) => {
                    if (val) setValue('category', val as CreateTicketInput['category']);
                  }}
                >
                  <SelectTrigger id="category" className="w-full data-[size=default]:h-11">
                    <SelectValue placeholder={t('customer.newTicket.categoryPlaceholder', 'Select issue category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-destructive text-sm">{te(errors.category.message ?? '')}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>{t('customer.newTicket.priority', 'Priority')}</Label>
                <div className="grid grid-cols-3 gap-2.5">
                  {TICKET_PRIORITIES.map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={selectedPriority === p ? 'default' : 'outline'}
                      aria-pressed={selectedPriority === p}
                      onClick={() => setValue('priority', p)}
                      className="h-11 font-semibold"
                    >
                      {ticketPriorityLabel(t, p)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">{t('customer.newTicket.subject', 'Subject')}</Label>
                <Input
                  id="subject"
                  maxLength={120}
                  placeholder={t('customer.newTicket.subjectPlaceholder', 'e.g. Internet speed drops after 8 PM every evening')}
                  className="h-11"
                  {...register('subject')}
                />
                {errors.subject && <p className="text-destructive text-sm">{te(errors.subject.message ?? '')}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">{t('customer.newTicket.message', 'Details')}</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder={t(
                    'customer.newTicket.messagePlaceholder',
                    'Describe what happens, when it started, and whether restarting the router helps…',
                  )}
                  {...register('message')}
                />
                {errors.message && <p className="text-destructive text-sm">{te(errors.message.message ?? '')}</p>}
              </div>

              <div className="bg-muted/50 text-muted-foreground flex items-start gap-2.5 rounded-lg border p-3 text-sm">
                <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {t(
                    'customer.newTicket.tip',
                    'Tip: if your ONT shows a red LOS light, check whether the yellow fibre patch cord is bent or unplugged before you submit.',
                  )}
                </span>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button variant="ghost" type="button" className="h-11 w-full sm:w-auto" render={<Link href="/customer/support" />}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="h-11 w-full gap-2 font-semibold sm:w-auto">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {createMutation.isPending ? t('customer.newTicket.submitting', 'Submitting…') : t('customer.newTicket.submit', 'Submit ticket')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </CustomerPageShell>
  );
}
