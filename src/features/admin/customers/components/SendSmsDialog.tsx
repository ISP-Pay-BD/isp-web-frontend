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
export function SendSmsDialog({ open, onOpenChange, ids, title = 'Send SMS', onSent }: SendSmsDialogProps) {
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
            {title}
          </DialogTitle>
          <DialogDescription>
            Message <strong className="text-foreground">{ids.length}</strong> selected customer{ids.length === 1 ? '' : 's'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label className="text-xs font-semibold">Message</Label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Type the SMS text…"
            className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary shadow-inner"
          />
          <p className="text-[11px] text-muted-foreground">
            {message.length} characters · {Math.max(1, Math.ceil(message.length / 160))} SMS part(s)
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={submit}
            disabled={!message.trim() || ids.length === 0 || sendSms.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
          >
            <Send className="h-3.5 w-3.5" /> {sendSms.isPending ? 'Sending…' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
