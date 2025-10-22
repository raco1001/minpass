#!/bin/bash

# 환경 변수 설정 검증 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 환경 변수 설정 검증"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ===================================
# 1. .env 파일 존재 여부 확인
# ===================================
echo "📁 Step 1: .env 파일 존재 여부 확인"
echo ""

check_file() {
  if [ -f "$1" ]; then
    echo -e "   ${GREEN}✅${NC} $1"
    return 0
  else
    echo -e "   ${RED}❌${NC} $1"
    return 1
  fi
}

ALL_FILES_EXIST=true

# 루트 .env
echo "🏠 루트 디렉토리:"
check_file "$PROJECT_ROOT/.env" || ALL_FILES_EXIST=false

echo ""
echo "🌐 APIs 서비스:"
check_file "$PROJECT_ROOT/apps/apis/.env" || ALL_FILES_EXIST=false
check_file "$PROJECT_ROOT/apps/apis/.env.example" || ALL_FILES_EXIST=false

echo ""
echo "🔐 Auth 서비스:"
check_file "$PROJECT_ROOT/apps/auth/.env" || ALL_FILES_EXIST=false
check_file "$PROJECT_ROOT/apps/auth/.env.example" || ALL_FILES_EXIST=false

echo ""
echo "👥 Users 서비스:"
check_file "$PROJECT_ROOT/apps/users/.env" || ALL_FILES_EXIST=false
check_file "$PROJECT_ROOT/apps/users/.env.example" || ALL_FILES_EXIST=false

# ===================================
# 2. ConfigModule 설정 확인
# ===================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Step 2: ConfigModule.forRoot 설정 확인"
echo ""

check_config_module() {
  local service=$1
  local module_file=$2
  
  echo "🔍 $service 서비스:"
  
  if [ ! -f "$module_file" ]; then
    echo -e "   ${RED}❌${NC} 모듈 파일이 존재하지 않습니다: $module_file"
    return 1
  fi
  
  if grep -q "envFilePath:" "$module_file"; then
    echo -e "   ${GREEN}✅${NC} envFilePath 설정됨"
    
    # 서비스별 .env 참조 확인
    if grep -q "apps/$service/.env" "$module_file"; then
      echo -e "   ${GREEN}✅${NC} 서비스별 .env 참조 설정됨"
    else
      echo -e "   ${YELLOW}⚠️${NC}  서비스별 .env 참조가 없습니다"
    fi
    
    # 루트 .env fallback 확인
    if grep -q 'process\.cwd(), "\.env' "$module_file"; then
      echo -e "   ${GREEN}✅${NC} 루트 .env fallback 설정됨"
    else
      echo -e "   ${YELLOW}⚠️${NC}  루트 .env fallback이 없습니다"
    fi
    
    return 0
  else
    echo -e "   ${RED}❌${NC} envFilePath가 설정되지 않았습니다"
    return 1
  fi
}

check_config_module "apis" "$PROJECT_ROOT/apps/apis/src/apis.module.ts"
echo ""
check_config_module "auth" "$PROJECT_ROOT/apps/auth/src/auth.module.ts"
echo ""
check_config_module "users" "$PROJECT_ROOT/apps/users/src/users.module.ts"

# ===================================
# 3. 주요 환경 변수 확인
# ===================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 Step 3: 주요 환경 변수 확인"
echo ""

check_env_var() {
  local file=$1
  local var=$2
  local description=$3
  
  if [ ! -f "$file" ]; then
    return 1
  fi
  
  if grep -q "^${var}=" "$file"; then
    local value=$(grep "^${var}=" "$file" | cut -d'=' -f2 | head -1)
    if [ -n "$value" ] && [ "$value" != "your-" ]; then
      echo -e "   ${GREEN}✅${NC} $description"
      return 0
    else
      echo -e "   ${YELLOW}⚠️${NC}  $description (값이 비어있거나 템플릿)"
      return 1
    fi
  else
    echo -e "   ${RED}❌${NC} $description"
    return 1
  fi
}

echo "🌐 APIs 서비스 (.env):"
check_env_var "$PROJECT_ROOT/apps/apis/.env" "PORT" "PORT"
check_env_var "$PROJECT_ROOT/apps/apis/.env" "ENABLED_PROVIDERS" "ENABLED_PROVIDERS"
check_env_var "$PROJECT_ROOT/apps/apis/.env" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_ID"

echo ""
echo "🔐 Auth 서비스 (.env):"
check_env_var "$PROJECT_ROOT/apps/auth/.env" "AUTH_GRPC_BIND_URL" "AUTH_GRPC_BIND_URL"
check_env_var "$PROJECT_ROOT/apps/auth/.env" "JWT_SECRET" "JWT_SECRET"
check_env_var "$PROJECT_ROOT/apps/auth/.env" "USERS_GRPC_TARGET_URL" "USERS_GRPC_TARGET_URL"

echo ""
echo "👥 Users 서비스 (.env):"
check_env_var "$PROJECT_ROOT/apps/users/.env" "USERS_GRPC_BIND_URL" "USERS_GRPC_BIND_URL"

echo ""
echo "🏠 루트 (.env):"
check_env_var "$PROJECT_ROOT/.env" "DB_HOST" "DB_HOST"
check_env_var "$PROJECT_ROOT/.env" "DB_NAME" "DB_NAME"
check_env_var "$PROJECT_ROOT/.env" "CA_CERT_PATH" "CA_CERT_PATH"

# ===================================
# 4. SSL 인증서 확인
# ===================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Step 4: SSL/TLS 인증서 확인"
echo ""

echo "📂 인증서 파일:"
check_file "$PROJECT_ROOT/certs/ca.crt"
check_file "$PROJECT_ROOT/certs/server.key"
check_file "$PROJECT_ROOT/certs/server.crt"
check_file "$PROJECT_ROOT/certs/client.key"
check_file "$PROJECT_ROOT/certs/client.crt"

echo ""
echo "🔍 Server 인증서 SAN (Subject Alternative Names) 확인:"
if [ -f "$PROJECT_ROOT/certs/server.crt" ]; then
  if openssl x509 -in "$PROJECT_ROOT/certs/server.crt" -text -noout | grep -A 3 "Subject Alternative Name" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅${NC} SAN이 포함되어 있습니다"
    echo ""
    openssl x509 -in "$PROJECT_ROOT/certs/server.crt" -text -noout | grep -A 3 "Subject Alternative Name" | sed 's/^/      /'
  else
    echo -e "   ${RED}❌${NC} SAN이 없습니다. 인증서를 재생성하세요:"
    echo "      ./scripts/regenerate-certs.sh"
  fi
else
  echo -e "   ${RED}❌${NC} server.crt 파일이 없습니다"
fi

# ===================================
# 최종 결과
# ===================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ALL_FILES_EXIST" = true ]; then
  echo -e "${GREEN}✅ 모든 설정이 올바릅니다!${NC}"
  echo ""
  echo "📝 다음 단계:"
  echo "   1. 모든 서비스 재시작:"
  echo "      터미널 1: pnpm start:users"
  echo "      터미널 2: pnpm start:auth"
  echo "      터미널 3: pnpm start:apis"
  echo ""
  echo "   2. OAuth 로그인 테스트"
else
  echo -e "${YELLOW}⚠️  일부 파일이 누락되었습니다${NC}"
  echo ""
  echo "🔧 해결 방법:"
  echo "   ./scripts/setup-all.sh"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"



