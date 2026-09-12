# Phase 8 — Module 0: Foundation, Auth, Permissions & Hierarchy

---

## 1. Scope & Objective
Establish core HTTP client infrastructure, token storage, silent refresh mechanism, user profile hydration, dynamic RBAC permission management, and system hierarchy trees against `isppaybd_isp/zapi`.

---

## 2. Endpoints Covered

### 2.1 Core Authentication
| Function | Endpoint | Method | Auth Required |
|---|---|---|---|
| User Login | `POST /api/v1/auth/login` | POST | No |
| Token Refresh | `POST /api/v1/auth/refresh` | POST | Refresh Token |
| Current Profile & Permissions | `GET /api/v1/auth/me` | GET | Bearer Token |
| Forgot Password Check | `POST /api/common/check-user` | POST | No |

### 2.2 Permissions & Role-Based Access Control (RBAC)
| Function | Endpoint / Strategy | Method | Description |
|---|---|---|---|
| Fetch Permission Sections | `GET /api/v1/auth/permission-sections` | GET | List of all modules, menus, and actions |
| Get Role Permissions | `GET /api/v1/auth/roles/{role}/permissions` | GET | Active action matrix for a role |
| Update Role Permissions | `PUT /api/v1/auth/roles/{role}/permissions` | PUT | Save customized permission toggles |
| Custom Access Rules | `GET/POST /api/v1/auth/custom-access` | GET/POST | Per-user granular permission overrides |

### 2.3 System Hierarchy Engine
| Function | Endpoint / Strategy | Method | Description |
|---|---|---|---|
| Platform Hierarchy | `GET /api/v1/platform/hierarchy` | GET | Full multi-tenant tree: SuperAdmin -> Tenants -> POPs -> Resellers -> Customers |
| Admin / Reseller Hierarchy | `GET /api/reseller/hierarchy/{resellerId}` | GET | Tenant-scoped tree: Reseller -> Areas -> Subareas -> Customers |

---

## 3. File Execution Plan

### 3.1 New Core API Files
- `src/lib/api/client.ts` — Axios instance with interceptors and refresh queue
- `src/lib/api/types.ts` — TypeScript interfaces for all responses, envelopes, and errors
- `src/lib/api/query-keys.ts` — Centralized TanStack Query key registry
- `src/lib/api/endpoints.ts` — URL constants mapping
- `src/lib/api/services/auth.service.ts` — Authentication & Permission API service methods
- `src/lib/api/services/hierarchy.service.ts` — Platform & Reseller hierarchy API service
- `src/lib/api/adapters/auth.adapter.ts` — User, token, and permission data transformers
- `src/lib/api/adapters/hierarchy.adapter.ts` — Tree node transformers for `HierarchyExplorer`
- `src/lib/api/utils/error-handler.ts` — Server validation error mapper for `react-hook-form`

### 3.2 Modified Files
- `src/features/auth/shared/stores/auth-store.ts` — Zustand store wired with real token persistence & permissions
- `src/features/shared/hierarchy/` — Connect `HierarchyExplorer` component to `hierarchy.service.ts`
- `src/features/admin/hierarchy/` & `src/features/platform/hierarchy/` — Replace mock calls
- `next.config.ts` — Proxy rewrite rules for `/api/backend`
- `.env.local` — Base API URL configuration

---

## 4. Test & Verification Gate 0

```bash
pnpm lint && pnpm typecheck && pnpm test
```

### Manual Verification Checklist:
- [ ] Login returns JWT pair and hydrates dynamic permissions into `useAuthStore`.
- [ ] Permission matrix editor loads sections and saves modified role permissions.
- [ ] `useFilteredNav` dynamically hides sidebar menu items based on returned permission tree.
- [ ] Hierarchy explorer renders visual node tree with real parent-child tenant/area relations.
- [ ] Silent refresh works on 401 without interruption.
