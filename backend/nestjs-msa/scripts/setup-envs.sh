#!/bin/bash

# 각 마이크로서비스별 .env 파일 생성 스크립트
# 루트 .env에서 필요한 정보를 추출하여 각 서비스에 맞게 생성

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ROOT_ENV="$PROJECT_ROOT/.env"

echo "📝 환경 변수 파일 생성 시작..."
echo "📁 프로젝트 루트: $PROJECT_ROOT"
echo ""

# ===================================
# 루트 .env에서 공통 설정 추출
# ===================================
if [ ! -f "$ROOT_ENV" ]; then
  echo "❌ 에러: 루트 .env 파일이 존재하지 않습니다: $ROOT_ENV"
  echo "   먼저 루트 .env 파일을 생성하세요."
  exit 1
fi

echo "🔍 루트 .env에서 설정 읽는 중..."

# 함수: 루트 .env에서 값 추출
get_env_value() {
  local key=$1
  local default=$2
  
  if [ -f "$ROOT_ENV" ]; then
    local value=$(grep "^${key}=" "$ROOT_ENV" | cut -d'=' -f2- | head -1)
    if [ -n "$value" ]; then
      echo "$value"
    else
      echo "$default"
    fi
  else
    echo "$default"
  fi
}

# 공통 DB 설정 추출
DB_NAME=$(get_env_value "DB_NAME" "minpass")
DB_HOST=$(get_env_value "DB_HOST" "127.0.0.1")
DB_PORT=$(get_env_value "DB_PORT" "3307")

# 각 서비스별 스키마 정보 추출
DB_USER_SCHEMA_NAME=$(get_env_value "DB_USER_SCHEMA_NAME" "svc-user")
DB_USER_SCHEMA_PASSWORD=$(get_env_value "DB_USER_SCHEMA_PASSWORD" "user")

DB_AUTH_SCHEMA_NAME=$(get_env_value "DB_AUTH_SCHEMA_NAME" "svc-auth")
DB_AUTH_SCHEMA_PASSWORD=$(get_env_value "DB_AUTH_SCHEMA_PASSWORD" "auth")

# SSL 인증서 경로
CA_CERT_PATH=$(get_env_value "CA_CERT_PATH" "certs/ca.crt")
SERVER_KEY_PATH=$(get_env_value "SERVER_KEY_PATH" "certs/server.key")
SERVER_CERT_PATH=$(get_env_value "SERVER_CERT_PATH" "certs/server.crt")
CLIENT_KEY_PATH=$(get_env_value "CLIENT_KEY_PATH" "certs/client.key")
CLIENT_CERT_PATH=$(get_env_value "CLIENT_CERT_PATH" "certs/client.crt")

echo "   ✅ 설정 읽기 완료"
echo ""

# ===================================
# Auth 서비스 .env 생성
# ===================================
echo "🔐 Step 1: Auth 서비스 환경 변수 생성..."

AUTH_ENV_PATH="$PROJECT_ROOT/apps/auth/.env"

if [ -f "$AUTH_ENV_PATH" ]; then
  BACKUP_PATH="${AUTH_ENV_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
  echo "   💾 기존 파일 백업: $BACKUP_PATH"
  cp "$AUTH_ENV_PATH" "$BACKUP_PATH"
fi

cat > "$AUTH_ENV_PATH" << EOF
# ===================================
# Auth Microservice Configuration
# ===================================
# 이 파일은 자동 생성되었습니다. 수동으로 수정 가능합니다.
# 재생성: ./scripts/setup-envs.sh

# ===================================
# Database Configuration
# ===================================
# MariaDB 연결 정보 (공통)
DB_NAME=$DB_NAME
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT

# Auth 스키마 전용 인증 정보
DB_AUTH_SCHEMA_NAME=$DB_AUTH_SCHEMA_NAME
DB_AUTH_SCHEMA_PASSWORD=$DB_AUTH_SCHEMA_PASSWORD

# ===================================
# SSL/TLS Certificates (gRPC)
# ===================================
CA_CERT_PATH=$CA_CERT_PATH
SERVER_KEY_PATH=$SERVER_KEY_PATH
SERVER_CERT_PATH=$SERVER_CERT_PATH
CLIENT_KEY_PATH=$CLIENT_KEY_PATH
CLIENT_CERT_PATH=$CLIENT_CERT_PATH

# ===================================
# gRPC Server Configuration
# ===================================
# Auth 서비스가 바인딩할 주소 (0.0.0.0:포트)
AUTH_GRPC_BIND_URL=0.0.0.0:4002

# ===================================
# JWT Token Configuration
# ===================================
# 액세스 토큰 시크릿 (최소 32자 권장)
JWT_SECRET=thisisaccess-dev-secret-please-change-in-production
JWT_EXPIRATION=15m

# 리프레시 토큰 시크릿 (액세스 토큰과 다른 값 사용)
REFRESH_TOKEN_SECRET=thisisrefresh-dev-secret-please-change-in-production
REFRESH_TOKEN_EXPIRATION=7d

# ===================================
# gRPC Client Configuration
# ===================================
# Auth 서비스가 Users 서비스에 연결할 주소
USERS_GRPC_TARGET_URL=127.0.0.1:4001

# ===================================
# Optional: Auth-specific Settings
# ===================================
# 비밀번호 해싱 라운드 (10-12 권장)
PASSWORD_SALT_ROUNDS=10

# 토큰 정리 주기 (밀리초, 1시간 = 3600000)
TOKEN_CLEANUP_INTERVAL=3600000
EOF

echo "   ✅ Auth .env 생성 완료: $AUTH_ENV_PATH"

# ===================================
# Users 서비스 .env 생성
# ===================================
echo ""
echo "👥 Step 2: Users 서비스 환경 변수 생성..."

USERS_ENV_PATH="$PROJECT_ROOT/apps/users/.env"

if [ -f "$USERS_ENV_PATH" ]; then
  BACKUP_PATH="${USERS_ENV_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
  echo "   💾 기존 파일 백업: $BACKUP_PATH"
  cp "$USERS_ENV_PATH" "$BACKUP_PATH"
fi

cat > "$USERS_ENV_PATH" << EOF
# ===================================
# Users Microservice Configuration
# ===================================
# 이 파일은 자동 생성되었습니다. 수동으로 수정 가능합니다.
# 재생성: ./scripts/setup-envs.sh

# ===================================
# Database Configuration
# ===================================
# MariaDB 연결 정보 (공통)
DB_NAME=$DB_NAME
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT

# Users 스키마 전용 인증 정보
DB_USER_SCHEMA_NAME=$DB_USER_SCHEMA_NAME
DB_USER_SCHEMA_PASSWORD=$DB_USER_SCHEMA_PASSWORD

# ===================================
# SSL/TLS Certificates (gRPC)
# ===================================
CA_CERT_PATH=$CA_CERT_PATH
SERVER_KEY_PATH=$SERVER_KEY_PATH
SERVER_CERT_PATH=$SERVER_CERT_PATH
CLIENT_KEY_PATH=$CLIENT_KEY_PATH
CLIENT_CERT_PATH=$CLIENT_CERT_PATH

# ===================================
# gRPC Server Configuration
# ===================================
# Users 서비스가 바인딩할 주소 (0.0.0.0:포트)
USERS_GRPC_BIND_URL=0.0.0.0:4001

# ===================================
# Optional: Users-specific Settings
# ===================================
# 사용자 캐시 TTL (초, 5분 = 300)
USER_CACHE_TTL=300

# 사용자 조회 쿼리 최대 개수
MAX_USERS_PER_QUERY=100
EOF

echo "   ✅ Users .env 생성 완료: $USERS_ENV_PATH"

# ===================================
# .env.example 파일들 생성
# ===================================
echo ""
echo "📋 Step 3: .env.example 파일 생성..."

# Auth .env.example
cat > "$PROJECT_ROOT/apps/auth/.env.example" << 'EOF'
# ===================================
# Auth Microservice Configuration
# ===================================

# ===================================
# Database Configuration
# ===================================
DB_NAME=minpass
DB_HOST=127.0.0.1
DB_PORT=3307

# Auth 스키마 전용 인증 정보
DB_AUTH_SCHEMA_NAME=svc-auth
DB_AUTH_SCHEMA_PASSWORD=auth

# ===================================
# SSL/TLS Certificates (gRPC)
# ===================================
CA_CERT_PATH=certs/ca.crt
SERVER_KEY_PATH=certs/server.key
SERVER_CERT_PATH=certs/server.crt
CLIENT_KEY_PATH=certs/client.key
CLIENT_CERT_PATH=certs/client.crt

# ===================================
# gRPC Server Configuration
# ===================================
AUTH_GRPC_BIND_URL=0.0.0.0:4002

# ===================================
# JWT Token Configuration
# ===================================
JWT_SECRET=your-strong-access-token-secret-here-min-32-chars
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your-strong-refresh-token-secret-here-min-32-chars
REFRESH_TOKEN_EXPIRATION=7d

# ===================================
# gRPC Client Configuration
# ===================================
USERS_GRPC_TARGET_URL=127.0.0.1:4001

# ===================================
# Optional Settings
# ===================================
PASSWORD_SALT_ROUNDS=10
TOKEN_CLEANUP_INTERVAL=3600000
EOF

echo "   ✅ apps/auth/.env.example 생성 완료"

# Users .env.example
cat > "$PROJECT_ROOT/apps/users/.env.example" << 'EOF'
# ===================================
# Users Microservice Configuration
# ===================================

# ===================================
# Database Configuration
# ===================================
DB_NAME=minpass
DB_HOST=127.0.0.1
DB_PORT=3307

# Users 스키마 전용 인증 정보
DB_USER_SCHEMA_NAME=svc-user
DB_USER_SCHEMA_PASSWORD=user

# ===================================
# SSL/TLS Certificates (gRPC)
# ===================================
CA_CERT_PATH=certs/ca.crt
SERVER_KEY_PATH=certs/server.key
SERVER_CERT_PATH=certs/server.crt
CLIENT_KEY_PATH=certs/client.key
CLIENT_CERT_PATH=certs/client.crt

# ===================================
# gRPC Server Configuration
# ===================================
USERS_GRPC_BIND_URL=0.0.0.0:4001

# ===================================
# Optional Settings
# ===================================
USER_CACHE_TTL=300
MAX_USERS_PER_QUERY=100
EOF

echo "   ✅ apps/users/.env.example 생성 완료"

# ===================================
# 검증
# ===================================
echo ""
echo "🔍 Step 4: 생성된 파일 검증..."
echo ""

echo "📁 Auth 서비스:"
if [ -f "$AUTH_ENV_PATH" ]; then
  echo "   ✅ .env 파일 존재"
  echo "   📊 환경 변수 개수: $(grep -v '^#' "$AUTH_ENV_PATH" | grep -v '^$' | wc -l)"
  echo "   🔍 DB 스키마: $(grep '^DB_AUTH_SCHEMA_NAME=' "$AUTH_ENV_PATH" | cut -d'=' -f2)"
else
  echo "   ❌ .env 파일 없음"
fi

if [ -f "$PROJECT_ROOT/apps/auth/.env.example" ]; then
  echo "   ✅ .env.example 파일 존재"
else
  echo "   ⚠️  .env.example 파일 없음"
fi

echo ""
echo "📁 Users 서비스:"
if [ -f "$USERS_ENV_PATH" ]; then
  echo "   ✅ .env 파일 존재"
  echo "   📊 환경 변수 개수: $(grep -v '^#' "$USERS_ENV_PATH" | grep -v '^$' | wc -l)"
  echo "   🔍 DB 스키마: $(grep '^DB_USER_SCHEMA_NAME=' "$USERS_ENV_PATH" | cut -d'=' -f2)"
else
  echo "   ❌ .env 파일 없음"
fi

if [ -f "$PROJECT_ROOT/apps/users/.env.example" ]; then
  echo "   ✅ .env.example 파일 존재"
else
  echo "   ⚠️  .env.example 파일 없음"
fi

# ===================================
# 완료
# ===================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 환경 변수 파일 생성 완료!"
echo ""
echo "📋 생성된 파일:"
echo "   • apps/auth/.env"
echo "   • apps/auth/.env.example"
echo "   • apps/users/.env"
echo "   • apps/users/.env.example"
echo ""
echo "📝 각 서비스별 포함된 설정:"
echo ""
echo "   🔐 Auth 서비스:"
echo "      - DB 공통 설정 (HOST, PORT, NAME)"
echo "      - DB_AUTH_SCHEMA_NAME, DB_AUTH_SCHEMA_PASSWORD"
echo "      - SSL/TLS 인증서 경로"
echo "      - JWT 설정"
echo "      - gRPC 서버/클라이언트 설정"
echo ""
echo "   👥 Users 서비스:"
echo "      - DB 공통 설정 (HOST, PORT, NAME)"
echo "      - DB_USER_SCHEMA_NAME, DB_USER_SCHEMA_PASSWORD"
echo "      - SSL/TLS 인증서 경로"
echo "      - gRPC 서버 설정"
echo ""
echo "📝 다음 단계:"
echo "   1. apps/apis/.env 확인 (OAuth 설정 포함)"
echo "   2. 각 서비스의 ConfigModule이 올바르게 설정되었는지 확인"
echo "      ./scripts/verify-config.sh"
echo "   3. 모든 서비스 재시작"
echo ""
echo "⚠️  주의사항:"
echo "   - JWT_SECRET과 REFRESH_TOKEN_SECRET은 운영 환경에서 반드시 변경하세요"
echo "   - .env 파일은 git에 커밋하지 마세요 (.gitignore 확인)"
echo "   - 각 서비스는 자신에게 필요한 DB 스키마 정보만 가집니다"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
