# Guide: Authentication, JWT & Role-Based Permissions

## 1. Filter Chain Pipeline
Every API request passes through a 3-tier filter security chain:
1. `zapijwt` (`JwtAuthFilter`): Validates cryptographic signature and expiration of Bearer JWT. Extracts `sub` (user ID), `role`, `admin_id`, and `tenant_id`.
2. `zapirole:<role>` (`RoleAuthFilter`): Ensures user has permissions for the portal role (e.g. `reseller`, `customer`, `super_admin`).
3. `zapipermission:<menu,submenu>` (`PermissionAuthFilter`): Validates fine-grained permissions against the user's custom access settings in the database.

## 2. JWT Token Payload
```json
{
  "iss": "isppaybd_api",
  "sub": 369,
  "role": "admin",
  "admin_id": null,
  "tenant_id": 1,
  "token_type": "access",
  "iat": 1741824000,
  "exp": 1741824900
}
```

## 3. Frontend Token Storage & Refresh
- Access token stored in `localStorage['isp-auth-storage']`.
- Refresh token stored in `localStorage['isp_refresh_token']`.
- On receiving HTTP 401, Axios interceptor pauses queued requests, invokes `POST /v1/auth/refresh`, updates the stored token, and replays pending requests seamlessly without user interruption.
