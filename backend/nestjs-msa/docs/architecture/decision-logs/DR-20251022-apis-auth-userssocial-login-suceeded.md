---
id: DR-20251022-apis-auth-userssocial-login-suceeded
title: "apis-auth-users:Social Login Suceeded"
status: Accepted
owners: [김종현]
created: 2025-10-22
updated: 2025-10-22
notes: ""
---

# apis-auth-users:Social Login Suceeded

## 1. Context

- Problem / Trigger: Completing Social Login Process
- Scope: Front-End(login page), Backend(Social Login : apis, auth, users ms)
- Assumptions:
- Background: Google API Project

## 2. Goals & Non-Goals

- Goals: Completing Social Login Requested from the Front End
- Non-Goals:

## 3. Options Considered

- Option A — Google Login
- Option B — GitHub Login
- Option C — KAKAO Login

## 4. Decision

- Chosen Option: Google Login
- Decision Type: Reversible
- Decision Horizon: short

## 5. Rationale

-

## 6. Consequences

- Positive:
- Negative / Risks:
- Mitigations:

## 7. Implementation Plan

- Owners: Me
- Milestones: Today
- Affected Artifacts:
  - Root - .env migration stript(scripts/setup-all.sh, scripts/setup-envs.sh, scripts/verify-config.sh) & cert creation script (scripts/regenerate-certs.sh) ,
  - apis - .env, auth.client.controller.ts ,
  - auth - .env, all features

## 8. Rollback / Exit Strategy

-

## 9. Validation & Metrics

- apps/auth/_/\*\*/_.spec.ts

## 10. Notes

- Login Succeeded
- auth: Creating Token Informations on the database -> Modified as Upsert
