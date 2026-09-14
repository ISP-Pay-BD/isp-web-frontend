---
name: goal
description: >-
  Persistent objective tracking (/goal). Set ONE goal, then keep working it
  across every turn and session until its completion criteria verifiably pass.
  Never close, abandon, pause, or downgrade the goal on your own. Use for
  "/goal <objective>", "set a goal", "keep going until done", "what is the
  goal", "/goal status", "/goal done", or whenever docs/GOAL-STATE.md has an
  ACTIVE goal at session start.
---

# Goal — persistent, never-close objective tracking

**The one rule:** a goal is a contract. Once ACTIVE, every turn must advance it,
and it may only be marked `DONE` after its completion criteria pass real
verification. It never closes on its own — only the user's explicit
`/goal done` (after criteria pass) or `/goal cancel` closes it.

---

## State file (single source of truth)

`docs/GOAL-STATE.md` — git-tracked, so the goal survives sessions, machines, and
context resets. There is **at most one ACTIVE goal** at a time (Claude Code
goal semantics). Read it **first thing every session**, before project docs.

If the file is missing, or `Status: NO ACTIVE GOAL` — create it from the
template below when the user sets a goal. Never delete the file; overwrite it.

```markdown
# Active Goal

Status: ACTIVE | BLOCKED(user-required) | DONE
Created: YYYY-MM-DD HH:mm
Updated: YYYY-MM-DD HH:mm

## Objective
<one sentence, measurable>

## Why
<motivation in 1–2 lines>

## Done when (completion criteria — ALL must pass)
- [ ] <criterion 1 — objectively checkable>
- [ ] <criterion 2>
- [ ] Verification: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` — 0 errors (adjust per goal; for backend: `php vendor/bin/phpunit` in ../isppaybd_isp)

## Plan
- [x] step completed
- [ ] step pending
- [ ] step pending

## Progress log
- YYYY-MM-DD HH:mm — what was done + evidence (test/build output, file list)

## Blockers (user action required)
- <only when Status: BLOCKED — say exactly what the user must provide>
```

---

## Commands

| Command | Action |
|---|---|
| `/goal <objective>` | Set/replace the goal. Write the state file, define measurable done-criteria + plan, then **start working immediately** |
| `/goal status` | Report status, plan progress, next step, blockers — no fluff |
| `/goal done` | Run the full completion gate. ALL criteria + verification must pass → mark `DONE`. Anything fails → report exactly what failed and keep working |
| `/goal cancel <reason>` | User-only escape hatch. Mark cancelled, keep the log for the record |
| (no command, goal ACTIVE) | Resume: re-read state file, pick the first pending step, work it, update the file |

---

## Working loop (every turn while ACTIVE)

1. **Read** `docs/GOAL-STATE.md` (fresh — it may have changed on disk).
2. **Advance** the first pending plan step. Do real work — never just talk
   about the goal.
3. **Verify** the step with the project gate where applicable
   (`pnpm lint && pnpm typecheck && pnpm test && pnpm build`).
4. **Update** the state file: tick the step, append a dated progress-log line
   with evidence, set `Updated:`.
5. **If a blocker needs the user** → set `Status: BLOCKED(user-required)`,
   state exactly what you need, and stop asking — but the goal stays ACTIVE.
   It auto-resumes next session.
6. **Repeat** until every done-criterion passes → then run the completion gate.

Never end a turn with "I'll continue later" and no file update — the log line
with evidence is what makes the goal survive.

---

## Completion gate (the only door to DONE)

1. Every checkbox under **Done when** is `[x]`.
2. Verification command(s) actually run this session, exit code 0, evidence
   quoted in the progress log (e.g. `typecheck: clean`, `tests 34/34`).
3. `/goal done` was issued by the user, **or** the user previously approved
   auto-complete for this goal (record that approval in the state file).
4. Then and only then: `Status: DONE`, final log entry with evidence.

If any criterion cannot be verified → the goal is **not** done. Report the gap,
keep the plan open, continue in the next turn.

---

## Prohibited (violations = failure)

- ❌ Marking DONE with failing/unrun verification, or "should be fine" reasoning
- ❌ Closing, cancelling, pausing, or redefining the goal without the user
- ❌ Silently dropping the goal because context was lost — the file is memory
- ❌ Working anything else while a goal is ACTIVE (unless the user redirects)
- ❌ Editing done-criteria to make them easier to pass
- ❌ Declaring BLOCKED for something you can solve yourself

---

## Repo notes

- This repo's verify gate: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
- Backend (`../isppaybd_isp`): `php vendor/bin/phpunit`
- Screen work also honors `docs/DEFINITION-OF-DONE.md` before its criterion
  may be ticked
