# Architecture Decision Log (ADL) — Template

> Scope: Frontend (Vite + React Compiler + FSD) — but adaptable for full‑stack.
> Guideline: One **Decision Record (DR)** per discrete decision. Keep each DR short; link out for details.

---

## Index

- Use file naming: `DR-YYYYMMDD-<slug>.md`
- Keep an `INDEX.md` summarizing all DRs with status.

Example index row:

```markdown
|  ID | Title                 | Status   | Owner | Created    | Last Updated |
| --: | --------------------- | -------- | ----- | ---------- | ------------ |
| 001 | Choose UI State Store | Accepted | alice | 2025-10-09 | 2025-10-09   |
```

---

## Decision Record Template

```markdown
---
id: DR-YYYYMMDD-<slug>
title: <short, imperative>
status: Proposed | Accepted | Deprecated | Superseded by <id>
owners: [name1, name2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
related:
  - DR-YYYYMMDD-<id>
  - link: <URL or path>
  - jira: <TICKET-ID>
---

## 1. Context

- **Problem / Trigger**: <why now?>
- **Scope**: <layers, teams, repos>
- **Assumptions**: <constraints, environment>
- **Background**: <prior art, experiments>

## 2. Goals & Non‑Goals

- **Goals**:
  - [ ] <goal 1>
  - [ ] <goal 2>
- **Non‑Goals**:
  - <explicitly out of scope>

## 3. Options Considered

- **Option A** — <name>
  - Summary
  - Pros
  - Cons
- **Option B** — <name>
  - Summary
  - Pros
  - Cons
- **Option C** — <name>
  - Summary
  - Pros
  - Cons

## 4. Decision

- **Chosen Option**: <A|B|C + brief reason>
- **Decision Type**: Reversible (easy | moderate | hard) / Irreversible
- **Decision Horizon**: short | medium | long term

## 5. Rationale (Why this, now?)

- <tie to goals, data, experiments, constraints>
- <trade‑offs accepted>

## 6. Consequences

- **Positive**: <benefits>
- **Negative / Risks**: <costs, tech debt, migration pain>
- **Mitigations**: <how we reduce risks>

## 7. Implementation Plan

- **Owner(s)**: <who>
- **Milestones**:
  1. <step> — D1
  2. <step> — D2
- **Affected Artifacts**:
  - Code: <paths/modules>
  - Docs: <files>
  - Infra: <pipelines, env vars>

## 8. Rollback / Exit Strategy

- **Rollback trigger**: <conditions>
- **Rollback plan**: <steps to revert>
- **Data impact**: <migrations, cleanup>

## 9. Validation & Metrics

- **Success Criteria**: <what proves it worked>
- **KPIs / SLIs**: <build time, TTI, error rate, CLS, etc.>
- **Measurement Method**: <tooling, dashboards>

## 10. Security & Privacy

- **AuthN/Z impact**: <cookies, tokens, RBAC>
- **Data Handling**: <PII, storage, retention>
- **Threats & Mitigations**: <XSS, CSRF, SSRF, supply chain>

## 11. Accessibility (a11y)

- **Considerations**: <keyboard nav, focus, ARIA>
- **Testing**: <axe, storybook a11y>

## 12. Internationalization (i18n/l10n)

- **Locales**: <supported languages>
- **Formatters**: <date/number/currency>

## 13. Performance

- **Budget**: <bundle size, LCP/TTI targets>
- **Optimizations**: <code splitting, compiler hints>

## 14. Observability

- **Logs / Traces / Metrics**: <tools>
- **Error Reporting**: <Sentry, etc.>

## 15. Dependencies

- **New deps**: <name@version — purpose>
- **Upgrade impact**: <breaking changes>

## 16. Open Questions

- [ ] <question>
- [ ] <question>

## 17. Changelog (for this DR)

- YYYY-MM-DD — <change>
```

---

## Pre‑Filled Examples (Frontend FSD)

### A) Routing & Guard Strategy

```markdown
id: DR-2025XXXX-routing-guard
title: Adopt SessionGuard at app/routes
status: Accepted
owners: [fe-lead]
created: 2025-10-09
updated: 2025-10-09

## 1. Context

Need authenticated routes without leaking server concerns into pages.

## 2. Goals

- [ ] Protect `/` and private areas via a single guard component.
- [ ] Keep pages free of API calls.

## 3. Options

A) Guard in `app/routes` (features/session)
B) Per-page manual checks

## 4. Decision

Choose A. Centralized, testable, fewer footguns.

## 5. Rationale

Aligns with FSD boundaries and reduces duplication.

## 6. Consequences

- Simpler pages

* Guard becomes critical path → needs tests

## 7. Implementation Plan

- Add `features/session/ui/SessionGuard.tsx`
- Wire in `app/routes.tsx`

## 8. Rollback

Return to per-page checks if guard proves too rigid.

## 9. Validation

E2E: unauthenticated user redirected from `/`→`/login`.
```

### B) State Store Choice (Zustand)

```markdown
id: DR-2025XXXX-state-store
title: Use Zustand for lightweight client state
status: Accepted
owners: [fe-lead]
created: 2025-10-09
updated: 2025-10-09

## 1. Context

We need a tiny global store for session/user.

## 2. Options

A) Zustand, B) Redux Toolkit, C) Jotai

## 4. Decision

Zustand (A) for minimal API and low boilerplate.

## 5. Rationale

Great DX, no Provider bloat, fits React Compiler well.

## 6. Consequences

- Simple; fast

* Less opinionated; define our own conventions
```

### C) Server State Manager (TanStack Query)

```markdown
id: DR-2025XXXX-server-state
title: Use TanStack Query for server state
status: Accepted
owners: [fe-lead]
created: 2025-10-09
updated: 2025-10-09

## 1. Context

Login/me/logout require caching, retries, invalidation.

## 2. Options

A) TanStack Query, B) SWR, C) Manual fetch

## 4. Decision

A) TanStack Query

## 5. Rationale

Best-in-class cache/invalidation and devtools.
```

---

## Authoring Tips

- Keep each DR under 1–2 pages; link details.
- Prefer **trade‑off clarity** over perfection.
- Update **status** promptly (Proposed→Accepted/Deprecated/Superseded).
- Cross‑link related DRs for traceability.

## INDEX.md Template

```markdown
# Decision Records Index

|                        ID | Title                            | Status   | Owner   | Created    | Last Updated | Notes      |
| ------------------------: | -------------------------------- | -------- | ------- | ---------- | ------------ | ---------- |
| DR-2025XXXX-routing-guard | Adopt SessionGuard at app/routes | Accepted | fe-lead | 2025-10-09 | 2025-10-09   | auth scope |
```
