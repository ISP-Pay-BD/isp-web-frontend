export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'ISP Pay BD',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  description: 'Multi-tenant ISP billing and operations platform for Bangladesh.',
  useMock: process.env.NEXT_PUBLIC_USE_MOCK !== 'false',
} as const;
