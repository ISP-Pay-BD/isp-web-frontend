# 04. Verification & Testing Standards

> How to verify API integrations safely with automated test suites and strict hardware-safety guarantees.

---

## 1. Safety Rules (Non-Negotiable)

1. **Zero Destructive MikroTik Hardware Writes:**
   - Never run raw modifying router terminal scripts (`/ip/hotspot/user/remove`, `/interface/disable`, etc.) on physical hardware during automated runs.
   - Use safe read-only routes (`/traffic`, `/dhcp-leases`, `/sessions`, `/routers/{id}`).
2. **Deterministic Test Isolation:**
   - Always run PHPUnit tests in memory with SQLite/mock fixtures.
   - Run Vitest tests with isolated React Query client instances.

---

## 2. Test Execution Commands

### 2.1 Backend Unit & Integration Tests (194 Tests)
Run from `isppaybd_isp/`:
```bash
vendor/bin/phpunit
```
- **Expected:** `OK (194 tests, 517 assertions)` with 0 failures.

### 2.2 Frontend Unit Tests & Typecheck
Run from `isp-web-frontend/`:
```bash
npm run typecheck && npm test
```
- **Expected:** `34/34 tests passed` and `0` TypeScript compilation errors.

### 2.3 Live Backend API Safe Read Health Check
Run from `isppaybd_isp/`:
```bash
php scripts/test_backend_api_suite.php
```
- **Expected:** All safe portal GET endpoints return `HTTP 200 OK` in `< 300ms`.

---

## 3. Definition of Done for Each Screen Migration

Before marking a screen complete in [`03-PHASE-BY-PHASE-CHECKLIST.md`](./03-PHASE-BY-PHASE-CHECKLIST.md):
- [ ] Remove `mockFetch(...)` references from the screen and its hooks.
- [ ] Connect hook to `src/lib/api/services/` using TanStack `useQuery` / `useMutation`.
- [ ] Verify error states, loading skeletons, and empty states.
- [ ] Run `npm run typecheck && npm test`.
- [ ] Verify live rendering in the browser.
