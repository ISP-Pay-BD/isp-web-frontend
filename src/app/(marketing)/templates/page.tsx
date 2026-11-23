import type { Metadata } from 'next';
import { TemplatesCatalogPage } from '@/features/marketing/templates';

export const metadata: Metadata = {
  title: 'ISP Website Templates — ISP Pay BD',
  description: 'Ready-made ISP website templates with package showcase, customer login and online bill payment.',
};

export default function TemplatesRoute() {
  return <TemplatesCatalogPage />;
}
