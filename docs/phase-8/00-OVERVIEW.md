# Phase 8 Architecture & Core Standards

---

## 1. Network & Proxy Architecture

To eliminate CORS during development and support secure cookie/header propagation:

### 1.1 Next.js Configuration (`next.config.ts`)
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

---

## 2. API Client Layer (`src/lib/api/`)

### 2.1 Standard Envelopes & Types (`src/lib/api/types.ts`)

```typescript
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  statusCode: number;
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: Record<string, string | string[]>;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 2.2 Client Implementation (`src/lib/api/client.ts`)
* Configured Axios instance using `/api/backend` base path.
* Request Interceptor: Injects `Authorization: Bearer <token>`.
* Response Interceptor: 
  * Unwraps `response.data.data` on success.
  * Captures `401 TOKEN_EXPIRED` -> pauses outgoing queue -> executes `POST /api/v1/auth/refresh` -> retries failed requests.
* Multipart upload support helper `client.upload(url, formData, onProgress)`.

---

## 3. Form Validation Binding & Toasts

Helper `src/lib/api/utils/error-handler.ts`:
* Maps `error.details` fields directly into `react-hook-form` via `setError()`.
* Fires `toast.error(error.message)` via Sonner.

---

## 4. Query Key Factory Pattern (`src/lib/api/query-keys.ts`)

Centralized key registry ensuring predictable TanStack Query cache invalidations across mutations.
