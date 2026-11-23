/** Landing CMS records (Rust `landing_cms`): blog posts, the templates catalogue and testimonials. */

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  thumbnail: string | null;
  excerpt: string;
  content: string;
  isFeatured: boolean;
  /** `true` = published, `false` = draft. */
  published: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Body of `POST /v1/platform/blogs` and `PUT /v1/platform/blogs/{id}`. */
export interface BlogInput {
  title: string;
  category: string;
  author: string;
  published_at: string;
  thumbnail: string;
  excerpt: string;
  content: string;
  is_featured: boolean;
  status: boolean;
}

export type TemplatePriceType = 'Free' | 'Paid' | 'Premium';

export interface LandingTemplate {
  id: string;
  title: string;
  slug: string;
  category: string;
  technology: string;
  demoUrl: string | null;
  image: string | null;
  priceType: string;
  price: number;
  description: string;
  /** One feature per line. */
  features: string[];
  isFeatured: boolean;
  /** `true` = visible on the public catalogue. */
  published: boolean;
  sortOrder: number;
  createdAt: string | null;
}

/** Body of `POST /v1/platform/templates` and `POST /v1/platform/templates/{id}/update`. */
export interface TemplateInput {
  title: string;
  category: string;
  technology: string;
  demo_url: string;
  image: string;
  price_type: TemplatePriceType;
  price: string;
  sort_order: string;
  description: string;
  features: string;
  is_featured: boolean;
  status: boolean;
}

export interface Review {
  id: string;
  userId: string | null;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  quote: string;
  initials: string;
  avatarUrl: string | null;
  rating: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string | null;
  submitterName: string;
  submitterRole: string;
  tenantName: string;
  /** The review's own contact, else the linked account / tenant (admin only). */
  contactEmail: string;
  contactPhone: string;
  contactCompany: string;
}

/** Body of `POST /v1/platform/reviews` and `POST /v1/platform/reviews/{id}/update`. */
export interface ReviewInput {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  quote: string;
  rating: number;
  sort_order: string;
  is_active: boolean;
}
