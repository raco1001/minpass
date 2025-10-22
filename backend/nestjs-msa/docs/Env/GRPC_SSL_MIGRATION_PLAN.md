# gRPC SSL/TLS 및 환경 변수 구조 개선 계획

## 🎯 목표

1. 마이크로서비스 간 gRPC 통신의 SSL/TLS 인증 문제 해결
2. 환경 변수 구조를 서비스별로 분리하여 관리 효율성 향상
3. 개발/운영 환경에 맞는 유연한 설정 지원

## 📊 현재 상황

### 통신 구조

```
Browser (HTTP)
    ↓
APIs (Port 3000) ← HTTP Gateway
    ↓ gRPC Client ✅
    ├─→ Auth (Port 4002) ← gRPC Server
    │       ↓ gRPC Client ❌ (SSL 인증서 문제)
    │       └─→ Users (Port 4001) ← gRPC Server
    └─→ Users (Port 4001) ← gRPC Server ✅
```

### 문제점

1. **SSL 인증서**: `localhost`만 포함, `127.0.0.1`, `0.0.0.0` 미포함
2. **환경 변수**: 모든 서비스가 루트 `.env` 공유, 불필요한 설정 노출
3. **통신 보안**: 마이크로서비스 간 mTLS 필요 여부 불명확

## 🔧 해결 방안

### Phase 1: SSL 인증서 재생성 (즉시 필요) ⚡

#### Option A: SAN 포함 인증서 생성 (권장)

```bash
# 1. OpenSSL 설정 파일 생성
cat > openssl-san.cnf <<EOF
[req]
default_bits = 4096
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = 0.0.0.0
IP.3 = ::1
EOF

# 2. CA 재생성 (선택사항, 기존 CA 사용 가능)
openssl genrsa -out certs/ca.key 4096
openssl req -x509 -new -nodes -key certs/ca.key -sha256 -days 365 \
  -out certs/ca.crt -subj "/CN=minpass-CA"

# 3. Server 인증서 재생성 (SAN 포함)
openssl genrsa -out certs/server.key 4096
openssl req -new -key certs/server.key -out certs/server.csr \
  -config openssl-san.cnf
openssl x509 -req -in certs/server.csr -CA certs/ca.crt -CAkey certs/ca.key \
  -CAcreateserial -out certs/server.crt -days 365 -sha256 \
  -extensions v3_req -extfile openssl-san.cnf

# 4. Client 인증서 재생성 (SAN 포함)
openssl genrsa -out certs/client.key 4096
openssl req -new -key certs/client.key -out certs/client.csr \
  -config openssl-san.cnf
openssl x509 -req -in certs/client.csr -CA certs/ca.crt -CAkey certs/ca.key \
  -CAcreateserial -out certs/client.crt -days 365 -sha256 \
  -extensions v3_req -extfile openssl-san.cnf

# 5. 인증서 검증
openssl x509 -in certs/server.crt -text -noout | grep -A 5 "Subject Alternative Name"
```

#### Option B: 개발 환경에서 Insecure 모드 사용 (빠른 테스트용)

```typescript
// apps/auth/src/infrastructure/clients/users-client/users.client.module.ts
credentials: GrpcCreds.createInsecure(), // 개발 환경 only
```

**권장**: Option A (SAN 인증서) - 운영 환경과 동일한 구조 유지

### Phase 2: 환경 변수 구조 개선 🏗️

#### 2.1 디렉토리 구조

```
nestjs-msa/
├── .env                          # 공통 설정 (DB, 외부 서비스)
├── .env.example                  # 공통 설정 템플릿
├── apps/
│   ├── apis/
│   │   ├── .env                  # APIs 전용 (OAuth, CORS, Port 3000)
│   │   └── .env.example
│   ├── auth/
│   │   ├── .env                  # Auth 전용 (JWT, gRPC 4002)
│   │   └── .env.example
│   └── users/
│       ├── .env                  # Users 전용 (gRPC 4001)
│       └── .env.example
└── libs/                         # 공통 라이브러리는 루트 .env 참조
```

#### 2.2 환경 변수 계층

**루트 `.env` (공통 설정)**

```bash
# Node Environment
NODE_ENV=development

# Database (모든 서비스 공유)
DB_NAME=minpass
DB_HOST=127.0.0.1
DB_PORT=3307

# User Service Schema
DB_USER_SCHEMA_NAME=svc-user
DB_USER_SCHEMA_PASSWORD=user

# Auth Service Schema
DB_AUTH_SCHEMA_NAME=svc-auth
DB_AUTH_SCHEMA_PASSWORD=auth

# Other Services...
DB_NOTIFICATION_SCHEMA_NAME=svc-notification
DB_NOTIFICATION_SCHEMA_PASSWORD=notification

# Neo4j (공유)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j
NEO4J_DATABASE=neo4j

# SSL/TLS Certificates (공통 경로)
CA_CERT_PATH=certs/ca.crt
SERVER_KEY_PATH=certs/server.key
SERVER_CERT_PATH=certs/server.crt
CLIENT_KEY_PATH=certs/client.key
CLIENT_CERT_PATH=certs/client.crt
```

**`apps/apis/.env` (APIs 서비스 전용)**

```bash
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5174

# OAuth Callback Base
REDIRECT_BASE_URL=http://localhost:3000

# Enabled OAuth Providers
ENABLED_PROVIDERS=google,github,kakao

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_PATH=/auth/login/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_PATH=/auth/login/github/callback

# Kakao OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_PATH=/auth/login/kakao/callback

# gRPC Client Connections (APIs → 다른 서비스)
AUTH_GRPC_TARGET_URL=127.0.0.1:4002
USERS_GRPC_TARGET_URL=127.0.0.1:4001
```

**`apps/auth/.env` (Auth 서비스 전용)**

```bash
# gRPC Server Binding
AUTH_GRPC_BIND_URL=0.0.0.0:4002

# JWT Configuration
JWT_SECRET=your-access-token-secret-here
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
REFRESH_TOKEN_EXPIRATION=7d

# gRPC Client Connections (Auth → Users)
USERS_GRPC_TARGET_URL=127.0.0.1:4001

# Optional: Auth-specific settings
PASSWORD_SALT_ROUNDS=10
TOKEN_CLEANUP_INTERVAL=3600000
```

**`apps/users/.env` (Users 서비스 전용)**

```bash
# gRPC Server Binding
USERS_GRPC_BIND_URL=0.0.0.0:4001

# Optional: Users-specific settings
USER_CACHE_TTL=300
```

#### 2.3 ConfigModule 설정 수정

**각 서비스의 `*.module.ts`에서:**

```typescript
// apps/auth/src/auth.module.ts
import { resolve } from 'path';

ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  expandVariables: true,
  envFilePath: [
    // 서비스 전용 설정 (우선순위 높음)
    resolve(process.cwd(), 'apps/auth/.env.local'),
    resolve(process.cwd(), 'apps/auth/.env'),
    // 공통 설정 (fallback)
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env'),
  ],
}),
```

### Phase 3: 통신 모듈 재구성 🔄

#### 3.1 gRPC 연결 타입 정의

**공통 타입 (libs/integrations/grpc/types.ts - 새로 생성)**

```typescript
export interface GrpcConnectionConfig {
  url: string;
  package: string;
  protoPath: string;
  useSsl: boolean;
  caPaths?: {
    ca: string;
    key: string;
    cert: string;
  };
}

export enum GrpcMode {
  SECURE = "secure",
  INSECURE = "insecure",
}
```

#### 3.2 각 서비스별 필요한 gRPC 모듈

| 서비스 | gRPC Server    | gRPC Client (연결 대상) |
| ------ | -------------- | ----------------------- |
| APIs   | ❌ (HTTP only) | ✅ Auth, Users          |
| Auth   | ✅ (4002)      | ✅ Users                |
| Users  | ✅ (4001)      | ❌ (없음)               |

## 📝 실행 계획

### Step 1: SSL 인증서 재생성 (5분)

```bash
# 스크립트 실행
./scripts/regenerate-certs.sh
```

### Step 2: Auth 서비스 환경 변수 분리 (10분)

1. `apps/auth/.env.example` 생성
2. `apps/auth/.env` 생성 및 설정
3. `apps/auth/src/auth.module.ts`의 `ConfigModule.forRoot` 수정
4. 불필요한 환경 변수 제거

### Step 3: Users 서비스 환경 변수 분리 (5분)

1. `apps/users/.env.example` 생성
2. `apps/users/.env` 생성 및 설정
3. `apps/users/src/users.module.ts`의 `ConfigModule.forRoot` 수정

### Step 4: 루트 .env 정리 (5분)

- OAuth 관련 설정 제거 (apis로 이동)
- JWT 관련 설정 제거 (auth로 이동)
- 공통 설정만 유지

### Step 5: 테스트 및 검증 (10분)

```bash
# 1. Users 서비스 재시작
pnpm start:users

# 2. Auth 서비스 재시작
pnpm start:auth

# 3. APIs 서비스 재시작
pnpm start:apis

# 4. OAuth 로그인 테스트
```

## 🎯 예상 효과

### 장점

1. ✅ **보안 향상**: 각 서비스가 필요한 설정만 접근
2. ✅ **유지보수성**: 서비스별 설정 분리로 변경 영향 범위 최소화
3. ✅ **배포 유연성**: 서비스별 독립적인 환경 변수 관리
4. ✅ **SSL/TLS 문제 해결**: SAN 포함 인증서로 모든 IP/hostname 지원

### 주의사항

1. ⚠️ 개발 환경과 운영 환경의 설정 차이 명확히 문서화
2. ⚠️ CI/CD 파이프라인에서 각 서비스별 `.env` 주입 방식 정의
3. ⚠️ `.env` 파일들을 `.gitignore`에 추가 (`.env.example`만 커밋)

## 🚀 다음 단계 제안

1. **현재 즉시**: SSL 인증서 재생성 (Option A 스크립트)
2. **단기 (1-2일)**: 환경 변수 구조 개선
3. **중기 (1주)**: gRPC 연결 헬스체크 및 모니터링 추가
4. **장기**: Kubernetes ConfigMap/Secret으로 마이그레이션 고려
