'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from '@/i18n/locale-context';
import { useCustomerActions } from '../hooks/use-customers';

interface SendSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Customer ids to message (POST /v1/reseller/sms/{rid}/send send_to). */
  ids: string[];
  title?: string;
  onSent?: () => void;
}

/** SMS to selected customers through the reseller SMS gateway. */
export function SendSmsDialog({ open, onOpenChange, ids, title, onSent }: SendSmsDialogProps) {
  const t = useTranslations();
  const { sendSms } = useCustomerActions();
  const [message, setMessage] = useState('');

  const submit = () => {
    sendSms.mutate(
      { ids, content: message.trim() },
      {
        onSuccess: () => {
          setMessage('');
          onOpenChange(false);
          onSent?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            {title ?? t('admin.customers.sms.title', 'Send SMS')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.customers.sms.description', 'Message {count} selected customer(s).', { count: ids.length })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label className="text-xs font-semibold">{t('admin.customers.sms.message', 'Message')}</Label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={t('admin.customers.sms.placeholder', 'Type the SMS text…')}
            className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary shadow-inner"
          />
          <p className="text-xs text-muted-foreground">
            {t('admin.customers.sms.counter', '{chars} characters · {parts} SMS part(s)', { chars: message.length, parts: Math.max(1, Math.ceil(message.length / 160)) })}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t('admin.customers.sms.cancel', 'Cancel')}
          </Button>
          <Button
            size="sm"
            onClick={submit}
            disabled={!message.trim() || ids.length === 0 || sendSms.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
          >
            <Send className="h-3.5 w-3.5" /> {sendSms.isPending ? t('admin.customers.sms.sending', 'Sending…') : t('admin.customers.sms.send', 'Send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
