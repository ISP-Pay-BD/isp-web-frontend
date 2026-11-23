export interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  thumbnail: string | null;
  excerpt: string;
  content: string;
  isFeatured: boolean;
  views: number;
  publishedAt: string | null;
}

export interface PublicBlogList {
  items: PublicBlogPost[];
  recent: PublicBlogPost[];
  /** `All` first, then each category with its published-post count. */
  categories: { name: string; count: number }[];
  /** Server paging (`meta`): current page, last page, matching posts. */
  page: number;
  lastPage: number;
  total: number;
}

export interface PublicBlogDetail {
  post: PublicBlogPost;
  related: PublicBlogPost[];
}
