'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Rocket,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { contactFormSchema, type ContactFormData } from '../schemas/contact.schema';
import { useTranslations } from '@/features/marketing/shared';

export function ContactPage() {
  const t = useTranslations();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      inquiryType: 'Demo Request',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    // Simulate API dispatch
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Message received!', {
      description: `Thanks ${data.name} — our Dhaka operations team will reach out within the hour.`,
    });
    reset();
  };

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            {t('marketing.pages.contact.badge')}
          </span>
          <h1 className="font-landing-display mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t('marketing.pages.contact.title')}
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed">
            {t('marketing.pages.contact.subtitle')}
          </p>
        </div>

        {/* Funnel Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <a
            href="/register"
            className="flex flex-col items-center rounded-2xl border border-landing-cta/40 bg-landing-panel/90 p-6 text-center transition-all hover:scale-105 shadow-xl shadow-orange-500/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-landing-cta/20 text-landing-cta border border-landing-cta/30 mb-4">
              <Rocket className="h-6 w-6" />
            </div>
            <strong className="text-white text-base">{t('marketing.pages.contact.trialTitle')}</strong>
            <span className="text-xs text-white/60 mt-1">{t('marketing.pages.contact.trialDesc')}</span>
          </a>

          <a
            href="https://wa.me/8801781808231?text=Hi%2C%20I%27d%20like%20to%20book%20an%20ISP%20Pay%20BD%20demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center transition-all hover:scale-105 hover:border-emerald-500/40 hover:bg-emerald-500/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <strong className="text-white text-base">Book WhatsApp Demo</strong>
            <span className="text-xs text-white/60 mt-1">Direct chat — we reply within the hour</span>
          </a>

          <a
            href="#contact-form"
            className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center transition-all hover:scale-105 hover:border-landing-accent/40 hover:bg-landing-accent/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-landing-panel text-landing-accent border border-white/10 mb-4">
              <Building className="h-6 w-6" />
            </div>
            <strong className="text-white text-base">Running 10k+ Lines?</strong>
            <span className="text-xs text-white/60 mt-1">Custom SLA, migration &amp; NOC support</span>
          </a>
        </div>

        {/* Form and Contact Info Grid */}
        <div id="contact-form" className="mt-16 grid gap-10 lg:grid-cols-12 items-start">
          {/* Left Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Our Address</h3>
                <p className="mt-1 text-xs text-white/70 leading-relaxed">
                  841 Badda Link Road, Middle Badda<br />
                  Dhaka 1212, Bangladesh
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Direct Phone Lines</h3>
                <p className="mt-1 text-xs text-white/70 font-mono space-y-1">
                  <span>+880 1781-808231 (Support &amp; Sales)</span><br />
                  <span>+880 1628-856735 (Accounts)</span><br />
                  <span>+880 1610-585100 (Emergency NOC)</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Email Address</h3>
                <p className="mt-1 text-xs text-white/70 font-mono">
                  info@isppaybd.com<br />
                  support@isppaybd.com
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Office Hours</h3>
                <p className="mt-1 text-xs text-white/70">
                  Saturday – Thursday: 10:00 AM – 8:00 PM<br />
                  Friday: Closed (Emergency automated line active)
                </p>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-landing-panel/90 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="font-landing-display text-2xl font-bold text-white">
              Tell us about your network
            </h2>
            <p className="mt-1 text-xs text-white/60">
              Share your subscriber count, current routers, and where manual billing slows you down.
            </p>

            {submitted && (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Thank you! Your message has been routed to our Dhaka operations team.</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  placeholder="Abdul Karim"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Phone Number (BD) *
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none font-mono"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="karim@ispname.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Inquiry Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Demo Request', 'Feature Update Request', 'Enterprise / Other'] as const).map(
                    (type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs text-white/80 hover:bg-white/10"
                      >
                        <input
                          type="radio"
                          value={type}
                          {...register('inquiryType')}
                          className="accent-landing-cta"
                        />
                        <span className="truncate">{type}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Your Message *
                </label>
                <textarea
                  {...register('message')}
                  rows={4}
                  placeholder="How many subscribers, which routers (MikroTik / OLT), and what questions do you have?"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-landing-cta hover:bg-landing-cta-hover text-white h-11 text-sm font-semibold"
              >
                {submitting ? 'Sending Message…' : 'Send Message'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
