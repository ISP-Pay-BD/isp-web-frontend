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
import { Reveal } from '@/components/motion/Reveal';
import { contactFormSchema, type ContactFormData } from '../schemas/contact.schema';
import { useTranslations } from '@/features/marketing/shared';

export function ContactSection() {
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
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Message received!', {
      description: `Thanks ${data.name} — our Dhaka operations team will reach out within the hour.`,
    });
    reset();
  };

  return (
    <section id="contact" className="border-t border-white/[0.07] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            {t('marketing.pages.contact.badge')}
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('marketing.pages.contact.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {t('marketing.pages.contact.subtitle')}
          </p>
        </Reveal>

        <ul className="mt-10 divide-y divide-white/10 border-y border-white/10 sm:grid sm:grid-cols-3 sm:divide-y-0 sm:border-0 sm:gap-8">
          <li className="py-4 sm:border-t sm:border-white/10 sm:py-5">
            <a href="/register" className="group block">
              <Rocket className="h-5 w-5 text-landing-cta" aria-hidden />
              <strong className="mt-3 block text-sm text-white group-hover:text-landing-cta">
                {t('marketing.pages.contact.trialTitle')}
              </strong>
              <span className="mt-1 block text-xs text-white/55">
                {t('marketing.pages.contact.trialDesc')}
              </span>
            </a>
          </li>
          <li className="py-4 sm:border-t sm:border-white/10 sm:py-5">
            <a
              href="https://wa.me/8801781808231?text=Hi%2C%20I%27d%20like%20to%20book%20an%20ISP%20Pay%20BD%20demo"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <MessageSquare className="h-5 w-5 text-landing-cta" aria-hidden />
              <strong className="mt-3 block text-sm text-white group-hover:text-landing-cta">
                {t('marketing.pages.contact.whatsappTitle')}
              </strong>
              <span className="mt-1 block text-xs text-white/55">
                {t('marketing.pages.contact.whatsappDesc')}
              </span>
            </a>
          </li>
          <li className="py-4 sm:border-t sm:border-white/10 sm:py-5">
            <a href="#contact-form" className="group block">
              <Building className="h-5 w-5 text-landing-cta" aria-hidden />
              <strong className="mt-3 block text-sm text-white group-hover:text-landing-cta">
                Running 10k+ lines?
              </strong>
              <span className="mt-1 block text-xs text-white/55">
                Custom SLA, migration &amp; NOC support
              </span>
            </a>
          </li>
        </ul>

        {/* Form + Contact Info Grid */}
        <div id="contact-form" className="mt-16 grid items-start gap-10 lg:grid-cols-12">
          {/* Left — Contact Info */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-landing-panel text-landing-cta">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Our Address</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/70">
                  841 Badda Link Road, Middle Badda<br />
                  Dhaka 1212, Bangladesh
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-landing-panel text-landing-cta">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Direct Phone Lines</h3>
                <p className="mt-1 space-y-1 font-mono text-xs text-white/70">
                  <span>+880 1781-808231 (Support &amp; Sales)</span><br />
                  <span>+880 1628-856735 (Accounts)</span><br />
                  <span>+880 1610-585100 (Emergency NOC)</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-landing-panel text-landing-cta">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Email Address</h3>
                <p className="mt-1 font-mono text-xs text-white/70">
                  info@isppaybd.com<br />
                  support@isppaybd.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-landing-panel text-landing-cta">
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

          {/* Right — Form */}
          <div className="rounded-2xl border border-white/15 bg-landing-panel/90 p-8 shadow-2xl backdrop-blur-xl lg:col-span-7">
            <h2 className="font-landing-display text-2xl font-bold text-white">
              Tell us about your network
            </h2>
            <p className="mt-1 text-xs text-white/60">
              Share your subscriber count, current routers, and where manual billing slows you down.
            </p>

            {submitted && (
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Thank you! Your message has been routed to our Dhaka operations team.</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/80">
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
                  <label className="mb-1.5 block text-xs font-semibold text-white/80">
                    Phone Number (BD) *
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/80">
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
                <label className="mb-1.5 block text-xs font-semibold text-white/80">
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
                    ),
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/80">
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
                className="h-11 w-full bg-landing-cta text-sm font-semibold text-white hover:bg-landing-cta-hover"
              >
                {submitting ? 'Sending Message…' : 'Send Message'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
