import { Level } from "../../logging/types/target.types";

/**
### 1. 리턴 형식

### 정상

- `data`: 단일 객체 또는 배열. 배열일 때 `meta.cursor/next_cursor/page_size` 사용.
- `total`: 비용 큰 카운트는 **기본 null**. 필요 시 `?include_total=true`.
- `elapsed_ms`: 서버 처리 시간(관측성).

```json
{
  "success": true,
  "data": { \/* 리소스 or 배열 *\/ },
  "meta": {
    "total": null,
    "page_size": 50,
    "cursor": "eyJvZmZzZXQiOjE3fQ==", // optional
    "next_cursor": "eyJvZmZzZXQiOjY3fQ==", // optional
    "elapsed_ms": 12
  },
  "request": {
    "id": "req_01HZY0YX9W6E9P9K2N3Q2Z2V9G",
    "received_at": "2025-09-18T12:34:56.789Z",
    "idempotency_key": "idem_abc123",
    "trace_id": "tr_9c1e0f8e..."
  },
  "version": "v1"
}

```
*/

export type SuccessResponse<
  T,
  R = {
    id: string;
    received_at: string;
    idempotency_key?: string;
    trace_id?: string;
    version: string;
  },
> = {
  success: true;
  data: T;
  meta?: {
    total?: number | null;
    page_size?: number;
    cursor?: string | null;
    next_cursor?: string | null;
    elapsed_ms?: number;
  };
  request: R;
  version: string;
};

/**



### 에러

- `type/title/status`는 RFC 7807 규격 키.
- `code`: 내부 비즈니스 에러 코드(대문자 스네이크).
- `errors[]`: 필드 단위 검증 실패 목록(폼·DTO 검증에 유용).
- `retriable/retry_after`: 클라이언트 재시도 정책에 직접 사용.

```json
{
  "success": false,
  "error": {
    "type": "https://api.minpass.dev/errors/schedule-conflict",
    "title": "Schedule conflict",
    "status": 409,
    "code": "SCHEDULE_CONFLICT",
    "detail": "The requested time overlaps with another event.",
    "instance": "/v1/schedules",
    "errors": [
      { "field": "start_ts", "issue": "overlaps", "value": "2025-09-19T09:00:00Z" }
    ],
    "retriable": false,
    "retry_after": null,
    "suggestion": "Try one of the suggested timeslots.",
    "links": {
      "doc": "https://docs.minpass.dev/errors#SCHEDULE_CONFLICT"
    }
  },
  "request": {
    "id": "req_01HZY0...",
    "trace_id": "tr_9c1e0...",
    "received_at": "2025-09-18T12:35:00.123Z"
  },
  "version": "v1"
}

```
*/
export type FailureResponse<
  P = {
    type: string;
    title: string;
    status: number;
    code: string;
    detail?: string;
    instance?: string;
    errors?: { field: string; issue: string; value?: unknown }[];
    retriable?: boolean;
    retry_after?: number | null;
    suggestion?: string;
    links?: Record<string, string>;
  },
  R = {
    id: string;
    trace_id?: string;
    received_at: string;
  },
> = {
  success: false;
  error: P;
  request: R;
  version: string;
};

/** 
### 로그

- **PII 금지 기본값**: `privacy.pii=false`. PII가 섞일 가능성 있으면 **사전 마스킹** 후 전송.
- 서버 수집 엔드포인트 예시: `POST /v1/logs/events` (배치 지원).

```json
{
  "ts": "2025-09-18T12:36:10.001Z",
  "level": "INFO",
  "event": "bridge.completed",
  "user_id": "usr_8c2a...",
  "session_id": "sess_a91f...",
  "trace_id": "tr_9c1e0...",
  "source": "mobile",         // mobile | web | server | worker
  "device": {
    "platform": "ios",
    "version": "17.4",
    "app_version": "1.2.3",
    "model": "iPhone15,3"
  },
  "metrics": { "duration_ms": 2845 },
  "context": {
    "bridge_score": 4,
    "questions": 5
  },
  "privacy": {
    "pii": false,
    "fields_redacted": []
  }
}
```
*/

export type LogEvent = {
  ts: string;
  level: Level;
  event: string;
  route?: string;
  status: number;
  durationMs?: number;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
  pid: string;
  host: string;
  service: string;
  env: string;
  user_id?: string | null;
  session_id?: string | null;
  trace_id?: string | null;
  source: "mobile" | "web" | "server" | "worker";
  device?: {
    platform?: string;
    version?: string;
    app_version?: string;
    model?: string;
  };
  metrics?: Record<string, number>;
  context?: Record<string, unknown>;
  privacy?: { pii: boolean; fields_redacted?: string[] };
};

/**
### 배치

```json
{
  "success": true,
  "data": {
    "accepted": 2,
    "rejected": 0
  },
  "meta": {},
  "request": { "id": "req_..." },
  "version": "v1"
}

```

## 4) 공통 헤더 & 규약

- **요청 헤더**
    - `Authorization: Bearer <token>`
    - `Idempotency-Key` (POST/PUT/DELETE에서 멱등성 보장)
    - `X-Trace-Id` (선택, 없으면 서버 생성)
    - `Accept-Language` (ko-KR, en-US)
- **응답 헤더**
    - `X-Request-Id`, `X-Trace-Id`
    - `Retry-After` (429/503 시)
- **날짜/시간 파라미터**: 항상 UTC ISO-8601, 타임존 변환은 클라이언트 책임
- **페이지네이션 쿼리**: `?cursor=...&limit=50`
- **선택 필드 확장**: `?include=attendees,quests`
- **필드 선택**: `?fields=id,title,start_ts`

---

## 5) 타입/스키마(참고용 TypeScript)

```tsx
type Success<T> = {
  success: true;
  data: T;
  meta?: {
    total?: number | null;
    page_size?: number;
    cursor?: string | null;
    next_cursor?: string | null;
    elapsed_ms?: number;
  };
  request: { id: string; received_at: string; idempotency_key?: string; trace_id?: string };
  version: string;
};

type FieldError = { field: string; issue: string; value?: unknown };

type Problem = {
  type: string; title: string; status: number; code: string; detail?: string;
  instance?: string; errors?: FieldError[]; retriable?: boolean;
  retry_after?: number | null; suggestion?: string; links?: Record<string,string>;
};

type Failure = {
  success: false;
  error: Problem;
  request: { id: string; trace_id?: string; received_at: string };
  version: string;
};

type LogEvent = {
  ts: string; level: Level;
  pid: string;
  host: string;
  service: string;
  env: string;
  event: string; user_id?: string | null; session_id?: string | null; trace_id?: string | null;
  source: "mobile"|"web"|"server"|"worker";
  device?: { platform?: string; version?: string; app_version?: string; model?: string };
  metrics?: Record<string, number>;
  context?: Record<string, unknown>;
  privacy?: { pii: boolean; fields_redacted?: string[] };
};

 */
