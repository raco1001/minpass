# Troubleshooting Guide

## UUID Version Mismatch Error

### 문제

```
Error: Invalid UUIDv7: 0048ae4f-ae4d-11f0-9979-8acdd435e32b
```

### 원인

데이터베이스에 UUIDv1 또는 다른 버전의 UUID로 저장된 기존 레코드가 존재합니다.

### 해결 방법

#### ✅ 방법 1: 데이터베이스 재시드 (권장 - 개발 단계)

**Auth Providers 재시드:**

```bash
# .env 파일이 올바르게 설정되었는지 확인
# 그 다음 시드 스크립트 실행
pnpm auth:seed-providers
```

**전체 데이터베이스 초기화:**

```sql
-- MariaDB/MySQL 클라이언트에서 실행
USE minpass;

-- Auth 서비스 테이블 초기화
TRUNCATE TABLE auth_tokens;
TRUNCATE TABLE auth_clients;
DELETE FROM auth_providers;

-- Provider 재시드는 위의 pnpm 명령어 사용
```

#### 방법 2: uuidv7Binary 유틸 업데이트 (기존 데이터 호환)

**변경 내용:**

- `libs/integrations/src/mariadb/util/uuidv7-binary.ts` → `uuid-binary.ts`로 변경
- UUID 버전 체크 제거 (v1, v4, v7 모두 허용)
- 새로운 레코드는 계속 UUIDv7 사용 (코드에서 `uuidv7()` 호출)

**주의사항:**

- 이 방법은 기존 데이터와의 호환성을 위한 것입니다
- 새로운 레코드는 반드시 UUIDv7을 사용하세요 (`v7 as uuidv7` from `uuid`)
- UUIDv7의 장점 (시간 정렬 가능, DB 인덱스 효율성)을 활용하려면 방법 1 권장

## 환경 변수 로딩 문제

### 문제

```
ENABLED_PROVIDERS: undefined
No Passport strategies registered!
```

### 해결 방법

1. `.env` 파일 존재 확인:

```bash
ls -la apps/apis/.env
```

2. 환경 변수 확인:

```bash
node apps/apis/check-env.js
```

3. 서버 재시작:

```bash
# Ctrl+C로 현재 서버 중지
pnpm start:apis
```

## CORS 에러

### 문제

```
Access to XMLHttpRequest at 'http://localhost:3000/...' from origin 'http://localhost:5174'
has been blocked by CORS policy
```

### 해결 방법

`apps/apis/src/main.ts`에 CORS 설정이 되어 있는지 확인:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:5174",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: true,
});
```

## OAuth 인증 흐름 문제

### 403 Forbidden

**원인:** OAuth provider가 활성화되지 않았거나 환경 변수 누락

**해결:**

1. `.env` 파일에 provider 설정 확인
2. `ENABLED_PROVIDERS` 값 확인
3. 각 provider의 client ID/secret 확인
4. `apps/apis/OAUTH_SETUP.md` 참조

### 404 Not Found

**원인:** 라우트가 잘못되었거나 controller가 등록되지 않음

**해결:**

- OAuth는 `GET` 메소드 사용 (POST ❌)
- 경로: `/auth/login/:provider` (예: `/auth/login/google`)
- `AuthClientController`가 `ApisModule`에 등록되었는지 확인

## 데이터베이스 연결 문제

### Connection Refused

```bash
# MariaDB/MySQL 서버 상태 확인
sudo systemctl status mysql

# 서비스 시작
sudo systemctl start mysql

# 연결 테스트
mysql -h 127.0.0.1 -P 3306 -u svc-auth -p
```

### Schema 권한 문제

```sql
-- 권한 부여
GRANT ALL PRIVILEGES ON minpass.* TO 'svc-auth'@'%';
FLUSH PRIVILEGES;
```

## 개발 팁

### 로그 레벨 조정

필요한 경우 NestJS 로거 레벨을 조정하세요:

```typescript
// main.ts
const app = await NestFactory.create(ApisModule, {
  logger: ["log", "error", "warn", "debug", "verbose"],
});
```

### 디버그 모드 실행

```bash
pnpm start:debug  # Chrome DevTools 사용 가능
```

### Hot Reload 문제

`--watch` 모드에서 변경사항이 반영되지 않으면:

```bash
# 캐시 삭제 후 재시작
rm -rf dist/
pnpm start:apis
```
