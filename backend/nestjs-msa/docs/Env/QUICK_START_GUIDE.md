# 🚀 빠른 시작 가이드: gRPC SSL 문제 해결

## 📋 체크리스트

- [ ] SSL 인증서 재생성 (SAN 포함)
- [ ] Auth 서비스 환경 변수 분리
- [ ] Users 서비스 환경 변수 분리
- [ ] 루트 .env 정리
- [ ] 모든 서비스 재시작
- [ ] OAuth 로그인 테스트

## ⚡ 즉시 실행 (5분)

### Option A: SSL 인증서만 빠르게 재생성 (권장)

```bash
# 1. 인증서 재생성 스크립트 실행
cd /home/orca/devs/projects/minpass/backend/nestjs-msa
./scripts/regenerate-certs.sh

# 2. Users 서비스 재시작 (별도 터미널)
pnpm start:users

# 3. Auth 서비스 재시작 (별도 터미널)
pnpm start:auth

# 4. APIs 서비스 재시작 (별도 터미널)
pnpm start:apis
```

**예상 결과**: Auth → Users gRPC 통신 성공, OAuth 로그인 가능

### Option B: 개발 환경에서 임시로 SSL 검증 비활성화 (빠른 테스트용)

아래 파일을 수정:

**`apps/auth/src/infrastructure/clients/users-client/users.client.module.ts`**

```typescript
// 기존
credentials: GrpcCreds.createSsl(ca, clientKey, clientCrt),

// 임시 변경 (개발 전용!)
credentials: GrpcCreds.createInsecure(),
```

**주의**: 이 방법은 테스트용이며, 운영 환경에서는 절대 사용 금지!

## 🏗️ 환경 변수 구조 개선 (30분)

### Step 1: Auth 서비스 환경 변수 분리

```bash
# 1. apps/auth/.env 파일 생성
cat > apps/auth/.env << 'EOF'
AUTH_GRPC_BIND_URL=0.0.0.0:4002
JWT_SECRET=thisisaccess
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=thisisrefresh
REFRESH_TOKEN_EXPIRATION=7d
USERS_GRPC_TARGET_URL=127.0.0.1:4001
PASSWORD_SALT_ROUNDS=10
EOF

echo "✅ apps/auth/.env 생성 완료"
```

### Step 2: Auth 서비스 ConfigModule 수정

**`apps/auth/src/auth.module.ts`**

기존:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
}),
```

수정:

```typescript
import { resolve } from 'path';

ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  expandVariables: true,
  envFilePath: [
    resolve(process.cwd(), 'apps/auth/.env.local'),
    resolve(process.cwd(), 'apps/auth/.env'),
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env'),
  ],
}),
```

### Step 3: Users 서비스 환경 변수 분리

```bash
# 1. apps/users/.env 파일 생성
cat > apps/users/.env << 'EOF'
USERS_GRPC_BIND_URL=0.0.0.0:4001
USER_CACHE_TTL=300
EOF

echo "✅ apps/users/.env 생성 완료"
```

### Step 4: Users 서비스 ConfigModule 수정

**`apps/users/src/users.module.ts`**

기존:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
}),
```

수정:

```typescript
import { resolve } from 'path';

ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  expandVariables: true,
  envFilePath: [
    resolve(process.cwd(), 'apps/users/.env.local'),
    resolve(process.cwd(), 'apps/users/.env'),
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env'),
  ],
}),
```

### Step 5: 루트 .env 정리

루트 `.env`에서 다음 항목 제거:

- `ENABLED_PROVIDERS`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`
- `REDIRECT_BASE_URL`

**이유**: 이들은 이미 `apps/apis/.env`와 `apps/auth/.env`에 있음

**남겨야 할 항목**:

- DB 관련 설정 (모든 서비스 공유)
- Neo4j 설정
- SSL 인증서 경로
- `NODE_ENV`, `FRONTEND_URL`

### Step 6: 모든 서비스 재시작

```bash
# 1. Users 서비스 재시작 (터미널 1)
pnpm start:users

# 2. Auth 서비스 재시작 (터미널 2)
pnpm start:auth

# 3. APIs 서비스 재시작 (터미널 3)
pnpm start:apis
```

## 🧪 테스트

### 1. gRPC 연결 확인

**Auth 서비스 로그에서 확인:**

```
✅ Auth 서비스 정상 시작 (4002)
✅ Users 클라이언트 연결 성공
```

**에러가 없어야 함:**

```
❌ Error [ERR_TLS_CERT_ALTNAME_INVALID] ← 더 이상 없어야 함
```

### 2. OAuth 로그인 테스트

브라우저에서:

```
http://localhost:5174
```

1. Google 로그인 버튼 클릭
2. OAuth 승인 완료
3. 로그인 성공 확인

### 3. 로그 확인

**예상 흐름:**

```
Browser → APIs (3000)
          ↓
APIs → Auth (4002) via gRPC ✅
       ↓
Auth → Users (4001) via gRPC ✅ (이전에 실패했던 부분)
       ↓
User 생성/조회 성공
       ↓
JWT 토큰 발급
       ↓
Browser로 리다이렉트 성공
```

## 📚 추가 문서

- **상세 마이그레이션 계획**: `GRPC_SSL_MIGRATION_PLAN.md`
- **환경 변수 템플릿**: `ENV_TEMPLATES.md`
- **일반 문제 해결**: `TROUBLESHOOTING.md`
- **gRPC URL 오류 가이드**: `ENV_FIX_GUIDE.md`

## 💡 팁

### SSL 인증서 검증

```bash
# Server 인증서의 SAN 확인
openssl x509 -in certs/server.crt -text -noout | grep -A 5 "Subject Alternative Name"

# 출력 예시:
# X509v3 Subject Alternative Name:
#     DNS:localhost, DNS:*.localhost, IP Address:127.0.0.1, IP Address:0.0.0.0, IP Address:0:0:0:0:0:0:0:1
```

### 포트 리스닝 확인

```bash
# Users 서비스 (4001)
netstat -tulpn | grep 4001

# Auth 서비스 (4002)
netstat -tulpn | grep 4002

# APIs 서비스 (3000)
netstat -tulpn | grep 3000
```

### 환경 변수 로딩 디버그

```bash
# Auth 서비스 시작 후 환경 변수 확인
# apps/auth/src/main.ts에 로그 추가:
console.log('🔍 Environment variables:');
console.log('  AUTH_GRPC_BIND_URL:', process.env.AUTH_GRPC_BIND_URL);
console.log('  USERS_GRPC_TARGET_URL:', process.env.USERS_GRPC_TARGET_URL);
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
```

## 🎯 우선순위

### 지금 당장 (5분)

1. ✅ SSL 인증서 재생성
2. ✅ 서비스 재시작
3. ✅ OAuth 테스트

### 오늘 중 (30분)

1. 환경 변수 구조 개선
2. ConfigModule 수정
3. 루트 .env 정리

### 다음 단계

1. 헬스체크 엔드포인트 추가
2. gRPC 연결 모니터링
3. 로깅 개선
