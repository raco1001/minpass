#!/bin/bash

# SSL/TLS 인증서 재생성 스크립트
# SAN(Subject Alternative Names) 포함하여 localhost, 127.0.0.1, 0.0.0.0 모두 지원

set -e  # 에러 발생 시 스크립트 중단

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CERTS_DIR="$PROJECT_ROOT/certs"

echo "🔐 SSL/TLS 인증서 재생성 시작..."
echo "📁 인증서 디렉토리: $CERTS_DIR"

# 백업 디렉토리 생성
if [ -d "$CERTS_DIR" ]; then
  BACKUP_DIR="$CERTS_DIR.backup.$(date +%Y%m%d_%H%M%S)"
  echo "💾 기존 인증서 백업: $BACKUP_DIR"
  cp -r "$CERTS_DIR" "$BACKUP_DIR"
fi

# 인증서 디렉토리 생성
mkdir -p "$CERTS_DIR"
cd "$CERTS_DIR"

# OpenSSL 설정 파일 생성
echo "📝 OpenSSL 설정 파일 생성..."
cat > openssl-san.cnf <<'EOF'
[req]
default_bits = 4096
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
CN = localhost
O = Minpass Development
OU = Engineering
C = KR

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = 0.0.0.0
IP.3 = ::1
EOF

# 1. CA (Certificate Authority) 생성
echo "🏛️  Step 1: CA 인증서 생성..."
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days 365 \
  -out ca.crt -subj "/CN=Minpass-CA/O=Minpass Development/C=KR" \
  -extensions v3_ca -config openssl-san.cnf

echo "   ✅ CA 생성 완료: ca.crt, ca.key"

# 2. Server 인증서 생성
echo "🖥️  Step 2: Server 인증서 생성 (SAN 포함)..."
openssl genrsa -out server.key 4096
openssl req -new -key server.key -out server.csr \
  -config openssl-san.cnf
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out server.crt -days 365 -sha256 \
  -extensions v3_req -extfile openssl-san.cnf

echo "   ✅ Server 인증서 생성 완료: server.crt, server.key"

# 3. Client 인증서 생성
echo "👤 Step 3: Client 인증서 생성 (SAN 포함)..."
openssl genrsa -out client.key 4096
openssl req -new -key client.key -out client.csr \
  -config openssl-san.cnf
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out client.crt -days 365 -sha256 \
  -extensions v3_req -extfile openssl-san.cnf

echo "   ✅ Client 인증서 생성 완료: client.crt, client.key"

# 4. 검증
echo ""
echo "🔍 Step 4: 인증서 검증..."
echo ""
echo "📋 Server 인증서 정보:"
openssl x509 -in server.crt -text -noout | grep -A 5 "Subject Alternative Name" || echo "   ⚠️  SAN 정보 없음 (예상치 못한 상황)"

echo ""
echo "📋 Server 인증서 유효기간:"
openssl x509 -in server.crt -noout -dates

# 5. 파일 권한 설정
echo ""
echo "🔒 Step 5: 파일 권한 설정..."
chmod 644 *.crt
chmod 600 *.key
chmod 644 openssl-san.cnf

# 6. 정리
echo ""
echo "🧹 Step 6: 임시 파일 정리..."
rm -f *.csr *.srl

# 7. 생성된 파일 목록
echo ""
echo "✅ 인증서 생성 완료! 다음 파일들이 생성되었습니다:"
echo ""
ls -lh "$CERTS_DIR" | grep -E '\.(crt|key|cnf)$'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 인증서 재생성이 완료되었습니다!"
echo ""
echo "📝 다음 단계:"
echo "   1. 모든 마이크로서비스 재시작:"
echo "      pnpm start:users"
echo "      pnpm start:auth"
echo "      pnpm start:apis"
echo ""
echo "   2. OAuth 로그인 테스트"
echo ""
echo "⚠️  주의사항:"
echo "   - 이 인증서는 개발 환경 전용입니다"
echo "   - 운영 환경에서는 공인 CA 인증서 사용 필수"
echo "   - 기존 인증서는 백업되었습니다: $BACKUP_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

