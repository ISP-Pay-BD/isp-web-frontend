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
pnpm test                  # Unit, architecture, and ratchet tests (Vitest)
pnpm test:architecture     # Structure / architecture only
pnpm test:unit             # Unit tests only
pnpm test:e2e              # Playwright End-to-End test suite (Chromium headless)
pnpm test:e2e:ui           # Playwright E2E interactive UI mode
pnpm test:watch            # Watch mode
```

## What architecture tests guard

- Required folders exist (`features/`, `components/`, etc.)
- `tests/` is separate from `src/app/`
- Clean API client exists as data boundary

## Adding tests

| Type | Location | Example |
|------|----------|---------|
| Permission/utils | `tests/unit/` | `can.test.ts` |
| Architecture rules | `tests/architecture/` | import boundary scans & ui ratchets |
| Component | `tests/unit/components/` | Button renders |
| E2E | `tests/e2e/` | Playwright (`*.spec.ts`) |

## Rules

- Unit tests import from `@/` alias (same as app)
- Do not put tests inside `src/app/` or `src/features/` co-located folders — keep root `tests/` for clarity
