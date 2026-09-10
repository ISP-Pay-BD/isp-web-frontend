'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Printer, 
  Copy, 
  Download, 
  Send, 
  ArrowLeft, 
  Receipt, 
  Sliders, 
  QrCode, 
  Barcode, 
  Check, 
  Sparkles, 
  Building, 
  CreditCard, 
  User, 
  Calendar, 
  Phone,
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';

export function PosReceiptPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const paymentId = params.id ?? 'pay_101';
  const { data, isLoading, isError, refetch } = useIspOps();

  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [paperTheme, setPaperTheme] = useState<'paper' | 'dark'>('paper');
  const [includeVat, setIncludeVat] = useState(true);
  const [includeQr, setIncludeQr] = useState(true);
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [includeSupport, setIncludeSupport] = useState(true);
  const [copied, setCopied] = useState(false);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load receipt" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const receipt =
    data.posReceipts.find((r) => r.paymentId === paymentId || r.id === paymentId) ?? data.posReceipts[0];

  if (!receipt) {
    return (
      <EmptyState 
        title="Receipt not found" 
        description="No POS transaction receipt located for this payment ID." 
        actionLabel="Back to Customer Payments"
        onAction={() => router.push('/admin/customer-payments')}
      />
    );
  }

  const vatAmount = includeVat ? receipt.amountBdt * 0.05 : 0;
  const netAmount = includeVat ? receipt.amountBdt - vatAmount : receipt.amountBdt;

  const handlePrint = () => {
    window.print();
    toast.success('Print command sent to thermal printer spooler');
  };

  const handleCopyRaw = () => {
    const rawText = `
========================================
         ISP PAY BD NETWORK
       ${receipt.branch.toUpperCase()}
   BIN: 003819283-0101 | Tel: 01700-000000
========================================
Receipt No : ${receipt.paymentId.toUpperCase()}
Date       : ${receipt.paidAt}
Collector  : ${receipt.collector}
----------------------------------------
Customer   : ${receipt.customerName}
Package    : ${receipt.packageName}
Net Amount : BDT ${netAmount.toFixed(2)}
${includeVat ? `Govt VAT 5%: BDT ${vatAmount.toFixed(2)}\n` : ''}----------------------------------------
TOTAL PAID : BDT ${receipt.amountBdt.toFixed(2)}
Method     : ${receipt.method.toUpperCase()}
Status     : PAID & RENEWED
========================================
   Thank you for choosing ISP Pay BD!
   Helpline: 01700-000000 (24/7 Support)
========================================
`;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    toast.success('ESC/POS raw receipt text copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSms = () => {
    toast.success(`SMS Receipt confirmation dispatched for ${receipt.customerName}`);
  };

  return (
    <div className="space-y-6">
      {/* Print-specific style block */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-pos-slip, #thermal-pos-slip * {
            visibility: visible;
          }
          #thermal-pos-slip {
            position: fixed;
            left: 0;
            top: 0;
            width: ${paperWidth === '80mm' ? '80mm' : '58mm'};
            margin: 0;
            padding: 4mm;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <PageHeader
        title="POS Thermal Receipt Workstation"
        subtitle={`Receipt Slip for Transaction Ref #${receipt.paymentId}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Customer Payments', url: '/admin/customer-payments' },
          { label: 'POS Receipt' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/customer-payments">
              <Button variant="outline" size="sm" className="text-xs border-border/70">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Ledger
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyRaw}
              className="text-xs border-border/70 hover:border-primary/50 text-foreground"
            >
              {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> : <Copy className="mr-1.5 h-3.5 w-3.5 text-primary" />}
              {copied ? 'Copied' : 'Copy ESC/POS'}
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-md shadow-primary/25 font-semibold"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print Receipt (Ctrl+P)
            </Button>
          </div>
        }
      />

      {/* Main Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT CONTROLS & SETTINGS (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Payment Details Card */}
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Transaction Summary
                </CardTitle>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase">
                  {receipt.method}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Subscriber Name:</span>
                <span className="font-semibold text-foreground">{receipt.customerName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Subscribed Package:</span>
                <span className="font-semibold text-foreground">{receipt.packageName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Branch / Counter:</span>
                <span className="font-mono text-foreground">{receipt.branch}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Collector / Cashier:</span>
                <span className="font-medium text-foreground">{receipt.collector}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Payment Date:</span>
                <span className="font-mono text-foreground">{receipt.paidAt}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground font-semibold">Total Collected:</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  ৳{receipt.amountBdt.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Thermal Printer Customizer */}
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Thermal Printer Formatting
              </CardTitle>
              <CardDescription className="text-xs">
                Configure width, paper style, and printable slip modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              {/* Width Selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Paper Roll Width</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperWidth('80mm')}
                    className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                      paperWidth === '80mm'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border/70 bg-card/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    80mm Standard POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperWidth('58mm')}
                    className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                      paperWidth === '58mm'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border/70 bg-card/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    58mm Mobile Bluetooth
                  </button>
                </div>
              </div>

              {/* Theme Mode Selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Preview Canvas Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperTheme('paper')}
                    className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                      paperTheme === 'paper'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border/70 bg-card/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    Thermal Paper (White)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperTheme('dark')}
                    className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                      paperTheme === 'dark'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border/70 bg-card/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    Dark Terminal (Matrix)
                  </button>
                </div>
              </div>

              {/* Section Toggles */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">5% Govt. VAT Breakdown</span>
                  <Switch checked={includeVat} onCheckedChange={setIncludeVat} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Verification QR Code</span>
                  <Switch checked={includeQr} onCheckedChange={setIncludeQr} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Code128 Barcode</span>
                  <Switch checked={includeBarcode} onCheckedChange={setIncludeBarcode} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">24/7 Helpline & Address</span>
                  <Switch checked={includeSupport} onCheckedChange={setIncludeSupport} />
                </div>
              </div>

              {/* Auxiliary Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
                <Button size="sm" variant="outline" onClick={handleSendSms} className="h-8 text-xs border-border/70 text-foreground">
                  <Send className="mr-1.5 h-3 w-3 text-primary" /> Send SMS Slip
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs border-border/70 text-foreground">
                  <Printer className="mr-1.5 h-3 w-3 text-primary" /> ESC/POS Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= RIGHT THERMAL SLIP CANVAS (7 Cols) ================= */}
        <div className="lg:col-span-7 flex justify-center py-2">
          {/* Slip Container with width constraints */}
          <div 
            id="thermal-pos-slip"
            className={`transition-all shadow-2xl relative select-none font-mono ${
              paperWidth === '80mm' ? 'w-full max-w-[380px]' : 'w-full max-w-[290px]'
            } ${
              paperTheme === 'paper'
                ? 'bg-[#fdfcf7] text-[#111111] border-x border-[#e2dfd2]'
                : 'bg-[#0f0919] text-[#e0daf0] border border-border/70'
            }`}
            style={{ minHeight: '520px' }}
          >
            {/* Top Serrated Edge */}
            <div 
              className={`h-3 w-full opacity-60 ${
                paperTheme === 'paper' ? 'bg-[#f0ece1]' : 'bg-[#1a0f2e]'
              }`}
              style={{
                clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
              }}
            />

            {/* Receipt Body */}
            <div className="p-6 text-center space-y-3.5 text-xs">
              {/* Brand Header */}
              <div className="space-y-1">
                <div className="font-extrabold text-base tracking-wider uppercase">
                  ISP PAY BD NETWORK
                </div>
                <div className="text-[11px] font-semibold opacity-80">
                  {receipt.branch.toUpperCase()}
                </div>
                {includeSupport && (
                  <div className="text-[10px] opacity-75 leading-tight pt-0.5">
                    BIN / VAT Reg: 003819283-0101<br />
                    Helpline: 01700-000000 | support@isppaybd.com
                  </div>
                )}
              </div>

              {/* Double Line Divider */}
              <div className="border-t-2 border-dashed border-current opacity-40 my-2" />

              {/* Receipt Metadata */}
              <div className="space-y-1 text-left text-[11px]">
                <div className="flex justify-between">
                  <span className="opacity-75">Receipt No:</span>
                  <span className="font-bold">{receipt.paymentId.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Date / Time:</span>
                  <span>{receipt.paidAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Cashier Desk:</span>
                  <span>{receipt.collector}</span>
                </div>
              </div>

              {/* Single Dashed Line */}
              <div className="border-t border-dashed border-current opacity-40 my-2" />

              {/* Subscriber Block */}
              <div className="space-y-1 text-left text-[11px]">
                <div className="flex justify-between">
                  <span className="opacity-75">Subscriber:</span>
                  <span className="font-bold">{receipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Plan Tier:</span>
                  <span className="font-semibold">{receipt.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Pay Method:</span>
                  <span className="uppercase font-bold">{receipt.method}</span>
                </div>
              </div>

              {/* Single Dashed Line */}
              <div className="border-t border-dashed border-current opacity-40 my-2" />

              {/* Itemized Billing Breakdown */}
              <div className="space-y-1.5 text-left text-[11px]">
                <div className="flex justify-between font-semibold pb-1 border-b border-current opacity-30">
                  <span>ITEM DESCRIPTION</span>
                  <span>AMOUNT</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Monthly Internet Sub</span>
                  <span>৳{netAmount.toFixed(2)}</span>
                </div>
                {includeVat && (
                  <div className="flex justify-between text-[10px] opacity-80">
                    <span>Govt. VAT (5%)</span>
                    <span>৳{vatAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total Block */}
              <div className="border-t-2 border-dashed border-current opacity-40 my-2 pt-2" />
              <div className="flex justify-between items-center text-sm font-extrabold">
                <span>TOTAL PAID:</span>
                <span className="text-base tracking-tight">
                  ৳{receipt.amountBdt.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-b-2 border-dashed border-current opacity-40 my-2" />

              {/* Status Note */}
              <div className="py-1 text-center font-bold text-[11px] uppercase tracking-wider">
                [ PAYMENT COMPLETED · LINE ACTIVE ]
              </div>

              {/* Barcode Graphic */}
              {includeBarcode && (
                <div className="pt-2 flex flex-col items-center justify-center space-y-1">
                  <div className="tracking-[4px] font-mono text-lg font-bold select-none scale-y-125 opacity-90">
                    ||| | |||| | || ||| || ||| | |||
                  </div>
                  <span className="text-[9px] font-mono opacity-70">
                    *{receipt.paymentId.toUpperCase()}*
                  </span>
                </div>
              )}

              {/* QR Code Verification */}
              {includeQr && (
                <div className="pt-2 flex flex-col items-center justify-center space-y-1">
                  <div className={`p-2 rounded border border-current opacity-85 ${paperTheme === 'paper' ? 'bg-white' : 'bg-black/30'}`}>
                    <QrCode className="h-16 w-16" />
                  </div>
                  <span className="text-[9px] opacity-75">Scan to verify authentic digital receipt</span>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 text-[10px] opacity-75 space-y-1 leading-relaxed border-t border-dashed border-current border-opacity-40">
                <p className="font-semibold uppercase tracking-wider">*** THANK YOU FOR CHOOSING US ***</p>
                <p>Keep this receipt for payment verification.</p>
                <p className="text-[9px] opacity-60 font-sans">Powered by ISP Pay BD v2.4</p>
              </div>
            </div>

            {/* Bottom Serrated Edge */}
            <div 
              className={`h-3 w-full opacity-60 ${
                paperTheme === 'paper' ? 'bg-[#f0ece1]' : 'bg-[#1a0f2e]'
              }`}
              style={{
                clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
