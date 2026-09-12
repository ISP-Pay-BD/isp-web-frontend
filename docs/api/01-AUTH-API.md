# 01. Authentication & Session API

> Endpoints managing user authentication, JWT lifecycle, token refreshing, and profile fetching.

## Endpoint List

| Method | Route | Controller & Action | Filters |
|---|---|---|---|
| `GET` | `/api/v1/auth/me` | `\…\Common\Auth\Controllers\AuthControllerV1::me` | `zapijwt cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/auth/login` | `\…\Common\Auth\Controllers\AuthControllerV1::login` | `cors maintenance tenantresolve trafficstart` |
| `POST` | `/api/v1/auth/refresh` | `\…\Common\Auth\Controllers\AuthControllerV1::refresh` | `cors maintenance tenantresolve trafficstart` |

## Authentication Flow
1. Client issues `POST /api/v1/auth/login` with `email` and `password`.
2. Server validates password against bcrypt hash.
3. Server generates:
   - `access_token` (JWT with user ID, role, tenant ID — 15 min expiry)
   - `refresh_token` (Secure random token — 30 days expiry)
4. Client attaches header: `Authorization: Bearer <access_token>` on all requests.
5. On 401 response, client calls `POST /api/v1/auth/refresh` with `refresh_token` to rotate keys without logging out.
