# Tests

Tests live **outside** `src/app` for clean separation from the Next.js application.

## Structure

```
tests/
├── setup/
│   └── vitest.setup.ts       # Global test setup (@testing-library/jest-dom)
├── architecture/             # Folder structure & boundary rules
│   └── folder-structure.test.ts
└── unit/                     # Pure logic tests
    └── permissions/
        └── can.test.ts
```

## Commands

```bash
pnpm test                  # All tests
pnpm test:architecture     # Structure / architecture only
pnpm test:unit             # Unit tests only
pnpm test:watch            # Watch mode
```

## What architecture tests guard

- Required folders exist (`features/`, `lib/mock-api/`, `mocks/`, etc.)
- `tests/` is separate from `src/app/`
- Mock API client exists as single data boundary

## Adding tests

| Type | Location | Example |
|------|----------|---------|
| Permission/utils | `tests/unit/` | `can.test.ts` |
| Architecture rules | `tests/architecture/` | import boundary scans |
| Component (later) | `tests/unit/components/` | Button renders |
| E2E (Phase 7) | `tests/e2e/` | Playwright |

## Rules

- Unit tests import from `@/` alias (same as app)
- Do not put tests inside `src/app/` or `src/features/` co-located folders — keep root `tests/` for clarity
