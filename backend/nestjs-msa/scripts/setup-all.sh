#!/bin/bash

# 전체 셋업 스크립트: 인증서 + 환경 변수 통합

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Minpass 마이크로서비스 전체 셋업"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "이 스크립트는 다음을 수행합니다:"
echo "  1. SSL/TLS 인증서 재생성 (SAN 포함)"
echo "  2. 각 마이크로서비스 환경 변수 파일 생성"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ===================================
# Step 1: SSL 인증서 재생성
# ===================================
echo "🔐 [1/2] SSL/TLS 인증서 재생성..."
echo ""

if [ -f "$SCRIPT_DIR/regenerate-certs.sh" ]; then
  bash "$SCRIPT_DIR/regenerate-certs.sh"
else
  echo "❌ 에러: regenerate-certs.sh 스크립트를 찾을 수 없습니다."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ===================================
# Step 2: 환경 변수 파일 생성
# ===================================
echo "📝 [2/2] 환경 변수 파일 생성..."
echo ""

if [ -f "$SCRIPT_DIR/setup-envs.sh" ]; then
  bash "$SCRIPT_DIR/setup-envs.sh"
else
  echo "❌ 에러: setup-envs.sh 스크립트를 찾을 수 없습니다."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 전체 셋업 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 완료된 작업:"
echo "   • SSL/TLS 인증서 재생성 (SAN 포함)"
echo "   • Auth 서비스 .env 생성"
echo "   • Users 서비스 .env 생성"
echo "   • .env.example 템플릿 생성"
echo ""
echo "📝 다음 단계:"
echo ""
echo "   1. ConfigModule 수정 (각 서비스에서 envFilePath 설정)"
echo "      • apps/auth/src/auth.module.ts"
echo "      • apps/users/src/users.module.ts"
echo ""
echo "   2. 루트 .env 정리"
echo "      다음 항목들을 제거하세요 (이미 서비스별 .env에 있음):"
echo "      • JWT_SECRET, REFRESH_TOKEN_SECRET"
echo "      • USERS_GRPC_TARGET_URL (중복 정의)"
echo "      • AUTH_GRPC_BIND_URL (중복 정의)"
echo ""
echo "   3. 모든 서비스 재시작"
echo "      터미널 1: pnpm start:users"
echo "      터미널 2: pnpm start:auth"
echo "      터미널 3: pnpm start:apis"
echo ""
echo "   4. OAuth 로그인 테스트"
echo "      브라우저에서 http://localhost:5174 접속"
echo ""
echo "📚 참고 문서:"
echo "   • QUICK_START_GUIDE.md - 빠른 시작 가이드"
echo "   • GRPC_SSL_MIGRATION_PLAN.md - 상세 마이그레이션 계획"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

