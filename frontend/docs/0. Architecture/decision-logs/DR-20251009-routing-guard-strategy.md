---
id: DR-20251009-routing-guard-strategy
title: Routing & Guard Strategy
status: Accepted
owners: [김종현]
created: 2025-10-09
updated: 2025-10-09
notes: ''
---

# Routing & Guard Strategy

## 1. Context

- Problem / Trigger: Need authenticated routes without leaking server concerns into pages.
- Scope: Auth
- Assumptions: None
- Background: FSD

## 2. Goals & Non-Goals

- Goals:
  - [x] Protect `/` and private areas via a single guard component.
  - [x] Keep pages free of API calls.
- Non-Goals:

## 3. Options Considered

- Option A — Guard in `app/routes` (features/session)
- Option B — Per-page manual checks
- Option C —

## 4. Decision

- Chosen Option: Choose A. Centralized, testable, fewer footguns.
- Decision Type: Irreversible
- Decision Horizon: short

## 5. Rationale

- Aligns with FSD boundaries and reduces duplication.

## 6. Consequences

- Positive: Simpler pages
- Negative / Risks: Guard becomes critical path → needs tests
- Mitigations:

## 7. Implementation Plan

- Owners:
- Milestones:
- Affected Artifacts:
  - features/session/ui/SessionGuard.tsx`
  - app/routes.tsx`

## 8. Rollback / Exit Strategy

- Return to per-page checks if guard proves too rigid.

## 9. Validation & Metrics

- E2E: unauthenticated user redirected from `/`→`/login`.

## 10. Notes

-
