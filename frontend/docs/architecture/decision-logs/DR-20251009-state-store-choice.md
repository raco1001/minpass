---
id: DR-20251009-state-store-choice
title: State Store Choice
status: Accepted
owners: [김종현]
created: 2025-10-09
updated: 2025-10-09
notes: ''
---

# State Store Choice

## 1. Context

- Problem / Trigger: We need a tiny global store for session/user.
- Scope: Global state
- Assumptions:
- Background:

## 2. Goals & Non-Goals

- Goals:
- Non-Goals:

## 3. Options Considered

- Option A — Zustand
- Option B — Redux Toolkit
- Option C — Jotai

## 4. Decision

- Chosen Option: Zustand (A) for minimal API and low boilerplate.
- Decision Type: Irreversible
- Decision Horizon: short

## 5. Rationale

- Great DX, no Provider bloat, fits React Compiler well.

## 6. Consequences

- Positive: Simple; fast
- Negative / Risks: Less opinionated; define my own conventions
- Mitigations:

## 7. Implementation Plan

- Owners:
- Milestones:
- Affected Artifacts:

## 8. Rollback / Exit Strategy

-

## 9. Validation & Metrics

-

## 10. Notes

-
