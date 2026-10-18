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
import { http } from '@/lib/api/client';
import { handleApiError } from '@/lib/api/utils/error-handler';

const INQUIRY_TYPE: Record<ContactFormData['inquiryType'], 'demo' | 'feature' | 'other'> = {
  'Demo Request': 'demo',
  'Feature Update Request': 'feature',
  'Enterprise / Other': 'other',
};

export function ContactSection() {
  const t = useTranslations();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      inquiryType: 'Demo Request',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    try {
      // POST /api/v1/public/contact → the platform Contacts inbox
      await http.post('/v1/public/contact', {
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        inquiry_type: INQUIRY_TYPE[data.inquiryType] ?? 'other',
      });
      setSubmitted(true);
      toast.success('Message received!', {
        description: `Thanks ${data.name} - our team will get back to you shortly.`,
      });
      reset();
    } catch (err) {
      handleApiError(err, (field, error) => setError(field as keyof ContactFormData, error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="border-t border-white/[0.07] py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <h2 className="font-landing-display text-[clamp(2rem,4.2vw,3.75rem)] font-semibold tracking-tight text-balance text-white">
            {t('marketing.pages.contact.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {t('marketing.pages.contact.subtitle')}
          </p>
        </Reveal>

        <ul className="mt-10 divide-y divide-white/10 border-y border-white/10 sm:grid sm:grid-cols-3 sm:gap-8 sm:divide-y-0 sm:border-0">
          <li className="py-4 sm:border-t sm:border-white/10 sm:py-5">
            <a href="/register" className="group block">
              <Rocket className="text-landing-accent h-5 w-5" aria-hidden />
              <strong className="group-hover:text-landing-accent mt-3 block text-sm text-white">
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
              <MessageSquare className="text-landing-accent h-5 w-5" aria-hidden />
              <strong className="group-hover:text-landing-accent mt-3 block text-sm text-white">
                {t('marketing.pages.contact.whatsappTitle')}
              </strong>
              <span className="mt-1 block text-xs text-white/55">
                {t('marketing.pages.contact.whatsappDesc')}
              </span>
            </a>
          </li>
          <li className="py-4 sm:border-t sm:border-white/10 sm:py-5">
            <a href="#contact-form" className="group block">
              <Building className="text-landing-accent h-5 w-5" aria-hidden />
              <strong className="group-hover:text-landing-accent mt-3 block text-sm text-white">
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
              <div className="bg-landing-panel text-landing-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Our Address</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/70">
                  841 Badda Link Road, Middle Badda
                  <br />
                  Dhaka 1212, Bangladesh
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="bg-landing-panel text-landing-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">
                  Direct Phone Lines
                </h3>
                <p className="mt-1 space-y-1 font-mono text-xs text-white/70">
                  <span>+880 1781-808231 (Support &amp; Sales)</span>
                  <br />
                  <span>+880 1628-856735 (Accounts)</span>
                  <br />
                  <span>+880 1610-585100 (Emergency NOC)</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="bg-landing-panel text-landing-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Email Address</h3>
                <p className="mt-1 font-mono text-xs text-white/70">
                  info@isppaybd.com
                  <br />
                  support@isppaybd.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="bg-landing-panel text-landing-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-landing-display text-sm font-bold text-white">Office Hours</h3>
                <p className="mt-1 text-xs text-white/70">
                  Saturday - Thursday: 10:00 AM - 8:00 PM
                  <br />
                  Friday: Closed (Emergency automated line active)
                </p>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-landing-panel/90 rounded-2xl border border-white/15 p-8 lg:col-span-7">
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
                  className="focus:border-landing-cta w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none"
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/80">
                    Phone Number (BD) *
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="01XXXXXXXXX"
                    className="focus:border-landing-cta w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-white/40 focus:outline-none"
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
                    className="focus:border-landing-cta w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none"
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
                  className="focus:border-landing-cta w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-landing-cta hover:bg-landing-cta-hover h-11 w-full text-sm font-semibold text-white"
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
