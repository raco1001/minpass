# 환경 변수 구조 가이드

## 📋 개요

각 마이크로서비스는 **자신의 `.env` 파일**과 **루트 `.env` 파일**을 계층적으로 참조합니다.

### 우선순위

```
서비스별 .env (최우선) → 루트 .env (fallback)
```

## 🏗️ 디렉토리 구조

```
nestjs-msa/
├── .env                          # 공통 설정 (DB, SSL 인증서)
├── .env.example                  # 공통 설정 템플릿
├── apps/
│   ├── apis/
│   │   ├── .env                  # APIs 전용 (OAuth, Port)
│   │   └── .env.example
│   ├── auth/
│   │   ├── .env                  # Auth 전용 + DB Auth 스키마
│   │   └── .env.example
│   └── users/
│       ├── .env                  # Users 전용 + DB Users 스키마
│       └── .env.example
└── certs/                        # SSL/TLS 인증서
```

## 📊 환경 변수 매핑

### 🏠 루트 `.env` (공통 설정)

모든 서비스가 공유하는 설정:

```bash
# Database 공통 설정
DB_NAME=minpass
DB_HOST=127.0.0.1
DB_PORT=3307

# 각 서비스별 스키마 인증 정보
DB_USER_SCHEMA_NAME=svc-user
DB_USER_SCHEMA_PASSWORD=user
DB_AUTH_SCHEMA_NAME=svc-auth
DB_AUTH_SCHEMA_PASSWORD=auth
DB_NOTIFICATION_SCHEMA_NAME=svc-notification
DB_NOTIFICATION_SCHEMA_PASSWORD=notification
DB_SCHEDULE_SCHEMA_NAME=svc-schedule
DB_SCHEDULE_SCHEMA_PASSWORD=schedule
DB_TASK_SCHEMA_NAME=svc-task
DB_TASK_SCHEMA_PASSWORD=task
DB_ACTIVITY_SCHEMA_NAME=svc-activity
DB_ACTIVITY_SCHEMA_PASSWORD=activity

# Neo4j (공유)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j
NEO4J_DATABASE=neo4j

# SSL/TLS 인증서 경로
CA_CERT_PATH=certs/ca.crt
SERVER_KEY_PATH=certs/server.key
SERVER_CERT_PATH=certs/server.crt
CLIENT_KEY_PATH=certs/client.key
CLIENT_CERT_PATH=certs/client.crt

# Frontend
FRONTEND_URL=http://localhost:5174
```

### 🌐 APIs 서비스 `apps/apis/.env`

**포함 설정:**

- OAuth 설정 (Google, GitHub, Kakao)
- Frontend 연결 설정
- gRPC 클라이언트 연결 URL

**특징:**

- 직접 DB 접근 없음 (스키마 인증 정보 불필요)
- HTTP 서버 (Port 3000)
- gRPC 클라이언트로만 동작

```bash
# Server
PORT=3000
FRONTEND_URL=http://localhost:5174
REDIRECT_BASE_URL=http://localhost:3000

# OAuth
ENABLED_PROVIDERS=google,github,kakao
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...

# gRPC Clients
AUTH_GRPC_TARGET_URL=127.0.0.1:4002
USERS_GRPC_TARGET_URL=127.0.0.1:4001
```

### 🔐 Auth 서비스 `apps/auth/.env`

**포함 설정:**

- DB 공통 설정 (HOST, PORT, NAME)
- **DB_AUTH_SCHEMA 인증 정보** ← 자신의 스키마만
- SSL/TLS 인증서 경로
- JWT 설정
- gRPC 서버/클라이언트 설정

**자동 생성 내용:**

```bash
# Database Configuration
DB_NAME=minpass                    # 루트 .env에서 복사
DB_HOST=127.0.0.1                  # 루트 .env에서 복사
DB_PORT=3307                       # 루트 .env에서 복사

# Auth 스키마 전용 인증 정보
DB_AUTH_SCHEMA_NAME=svc-auth       # 루트 .env에서 복사
DB_AUTH_SCHEMA_PASSWORD=auth       # 루트 .env에서 복사

# SSL/TLS Certificates
CA_CERT_PATH=certs/ca.crt          # 루트 .env에서 복사
SERVER_KEY_PATH=certs/server.key   # 루트 .env에서 복사
SERVER_CERT_PATH=certs/server.crt  # 루트 .env에서 복사
CLIENT_KEY_PATH=certs/client.key   # 루트 .env에서 복사
CLIENT_CERT_PATH=certs/client.crt  # 루트 .env에서 복사

# gRPC Server
AUTH_GRPC_BIND_URL=0.0.0.0:4002

# JWT
JWT_SECRET=...
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=...
REFRESH_TOKEN_EXPIRATION=7d

# gRPC Client (Users 서비스 연결)
USERS_GRPC_TARGET_URL=127.0.0.1:4001

# Optional
PASSWORD_SALT_ROUNDS=10
TOKEN_CLEANUP_INTERVAL=3600000
```

**접근 가능한 DB 스키마:**

- ✅ `svc-auth` (Auth 스키마)
- ❌ `svc-user` (Users 스키마 - 접근 불가)
- ❌ 기타 서비스 스키마

### 👥 Users 서비스 `apps/users/.env`

**포함 설정:**

- DB 공통 설정 (HOST, PORT, NAME)
- **DB_USER_SCHEMA 인증 정보** ← 자신의 스키마만
- SSL/TLS 인증서 경로
- gRPC 서버 설정

**자동 생성 내용:**

```bash
# Database Configuration
DB_NAME=minpass                    # 루트 .env에서 복사
DB_HOST=127.0.0.1                  # 루트 .env에서 복사
DB_PORT=3307                       # 루트 .env에서 복사

# Users 스키마 전용 인증 정보
DB_USER_SCHEMA_NAME=svc-user       # 루트 .env에서 복사
DB_USER_SCHEMA_PASSWORD=user       # 루트 .env에서 복사

# SSL/TLS Certificates
CA_CERT_PATH=certs/ca.crt          # 루트 .env에서 복사
SERVER_KEY_PATH=certs/server.key   # 루트 .env에서 복사
SERVER_CERT_PATH=certs/server.crt  # 루트 .env에서 복사
CLIENT_KEY_PATH=certs/client.key   # 루트 .env에서 복사
CLIENT_CERT_PATH=certs/client.crt  # 루트 .env에서 복사

# gRPC Server
USERS_GRPC_BIND_URL=0.0.0.0:4001

# Optional
USER_CACHE_TTL=300
MAX_USERS_PER_QUERY=100
```

**접근 가능한 DB 스키마:**

- ✅ `svc-user` (Users 스키마)
- ❌ `svc-auth` (Auth 스키마 - 접근 불가)
- ❌ 기타 서비스 스키마

## 🔒 보안 원칙

### 최소 권한 원칙

각 서비스는 **자신에게 필요한 DB 스키마 인증 정보만** 가집니다:

- ✅ Auth 서비스 → `DB_AUTH_SCHEMA_NAME`, `DB_AUTH_SCHEMA_PASSWORD`
- ✅ Users 서비스 → `DB_USER_SCHEMA_NAME`, `DB_USER_SCHEMA_PASSWORD`
- ❌ Auth 서비스는 Users 스키마 접근 불가
- ❌ Users 서비스는 Auth 스키마 접근 불가

### 장점

1. **보안 강화**: 한 서비스가 침해되어도 다른 서비스의 DB 스키마는 안전
2. **명확한 책임**: 각 서비스의 데이터 접근 범위가 명확
3. **유지보수성**: 서비스별 설정 변경이 다른 서비스에 영향 없음

## 🛠️ 관리 명령어

### 환경 변수 파일 생성/재생성

```bash
# 루트 .env에서 읽어서 각 서비스 .env 자동 생성
./scripts/setup-envs.sh
```

**동작:**

1. 루트 `.env`에서 DB 설정 읽기
2. 각 서비스별로 필요한 정보만 추출
3. `apps/auth/.env`, `apps/users/.env` 생성
4. 기존 파일이 있으면 `.backup` 파일로 백업

### 전체 셋업 (인증서 + 환경 변수)

```bash
# SSL 인증서 재생성 + 환경 변수 파일 생성
./scripts/setup-all.sh
```

### 설정 검증

```bash
# 모든 설정이 올바른지 검증
./scripts/verify-config.sh
```

## 📝 ConfigModule 설정

각 서비스의 `*.module.ts`에서 환경 변수 로딩 순서:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  expandVariables: true,
  envFilePath: [
    // 1순위: 서비스 전용 .env.local (개발자별 오버라이드)
    resolve(process.cwd(), 'apps/[service]/.env.local'),
    // 2순위: 서비스 전용 .env
    resolve(process.cwd(), 'apps/[service]/.env'),
    // 3순위: 루트 .env.local (공통 오버라이드)
    resolve(process.cwd(), '.env.local'),
    // 4순위: 루트 .env (공통 기본값)
    resolve(process.cwd(), '.env'),
    // Fallback: dist에서 실행될 경우
    resolve(__dirname, '../../../apps/[service]/.env'),
    resolve(__dirname, '../../../.env'),
  ],
}),
```

## 🎯 사용 예시

### Auth 서비스에서 DB 연결

```typescript
// apps/auth/src/auth.module.ts
MariaDbModule.registerAsync(
  'auth',
  (cfg: ConfigService): MariaDbOptions => ({
    name: 'auth',
    host: cfg.get<string>('DB_HOST'),         // ✅ 서비스 .env 또는 루트 .env
    port: parseInt(cfg.get<string>('DB_PORT')), // ✅ 서비스 .env 또는 루트 .env
    user: cfg.get<string>('DB_AUTH_SCHEMA_NAME'), // ✅ 서비스 .env에만 존재
    password: cfg.get<string>('DB_AUTH_SCHEMA_PASSWORD'), // ✅ 서비스 .env에만 존재
    database: cfg.get<string>('DB_NAME'),     // ✅ 서비스 .env 또는 루트 .env
    // ...
  }),
  [ConfigService],
  [ConfigModule],
),
```

### Users 서비스에서 DB 연결

```typescript
// apps/users/src/users.module.ts
MariaDbModule.registerAsync(
  'users',
  (cfg: ConfigService): MariaDbOptions => ({
    name: 'users',
    host: cfg.get<string>('DB_HOST'),         // ✅ 서비스 .env 또는 루트 .env
    port: parseInt(cfg.get<string>('DB_PORT')), // ✅ 서비스 .env 또는 루트 .env
    user: cfg.get<string>('DB_USER_SCHEMA_NAME'), // ✅ 서비스 .env에만 존재
    password: cfg.get<string>('DB_USER_SCHEMA_PASSWORD'), // ✅ 서비스 .env에만 존재
    database: cfg.get<string>('DB_NAME'),     // ✅ 서비스 .env 또는 루트 .env
    // ...
  }),
  [ConfigService],
  [ConfigModule],
),
```

## ⚠️ 주의사항

### .gitignore 확인

```gitignore
# 환경 변수 파일 (절대 커밋하지 말 것)
.env
.env.local
apps/*/.env
apps/*/.env.local

# .env.example은 커밋 가능 (템플릿)
!.env.example
!apps/*/.env.example
```

### 운영 환경

- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`은 강력한 랜덤 값으로 변경
- DB 비밀번호는 안전한 값으로 변경
- SSL 인증서는 공인 CA 인증서 사용

### 개발자별 설정 오버라이드

개발자마다 다른 설정이 필요한 경우:

```bash
# 각 서비스별 .env.local 생성 (git ignore됨)
cp apps/auth/.env apps/auth/.env.local
# .env.local 수정
```

## 🚀 빠른 시작

```bash
# 1. 전체 셋업
./scripts/setup-all.sh

# 2. 설정 검증
./scripts/verify-config.sh

# 3. 서비스 시작
pnpm start:users   # 터미널 1
pnpm start:auth    # 터미널 2
pnpm start:apis    # 터미널 3
```


