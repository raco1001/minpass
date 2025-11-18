# gRPC 연결 에러 해결 가이드

## 🔍 문제 원인

```bash
Error: 14 UNAVAILABLE: Name resolution failed for target dns:http://localhost:4001
```

**원인**: `.env` 파일의 gRPC URL에 `http://` 프로토콜이 포함되어 있습니다.

gRPC는 HTTP/2 기반이지만, URL에 스킴(`http://`, `https://`)을 포함하면 DNS 해석 오류가 발생합니다.

## ✅ 해결 방법

### 1. `.env` 파일 수정

루트 디렉토리의 `.env` 파일을 열고 다음 라인을 수정하세요:

**❌ 잘못된 설정 (51번째 라인):**

```bash
USERS_GRPC_TARGET_URL=http://localhost:4001
```

**✅ 올바른 설정:**

```bash
USERS_GRPC_TARGET_URL=127.0.0.1:4001
```

### 2. 중복 설정 제거

`.env` 파일에 `AUTH_GRPC_BIND_URL`이 두 번 정의되어 있습니다:

```bash
# API CLIENTS
AUTH_GRPC_BIND_URL=http://localhost:4002  # ← 이 라인 삭제

# MS HOSTS
## Auth MS
AUTH_GRPC_BIND_URL=0.0.0.0:4002  # ← 이것만 유지
```

첫 번째 `AUTH_GRPC_BIND_URL=http://localhost:4002` 라인을 삭제하세요.

### 3. 최종 설정 예시

```bash
# SSL/TLS Certifications (gRPC mTLS)
CA_CERT_PATH=certs/ca.crt
SERVER_KEY_PATH=certs/server.key
SERVER_CERT_PATH=certs/server.crt
CLIENT_KEY_PATH=certs/client.key
CLIENT_CERT_PATH=certs/client.crt

# API CLIENTS (gRPC 연결 URL)
USERS_GRPC_TARGET_URL=127.0.0.1:4001

# MS HOSTS (gRPC 바인드 URL)

## Auth MS
AUTH_GRPC_BIND_URL=0.0.0.0:4002
JWT_SECRET=thisisaccess
REFRESH_TOKEN_SECRET=thisisrefresh

## Users MS
USERS_GRPC_BIND_URL=0.0.0.0:4001
```

### 4. Auth 서비스 재시작

```bash
# 현재 실행 중인 auth 서비스 중지 (Ctrl+C)
# 그 다음:
pnpm start:auth
```

Users 서비스는 이미 정상적으로 실행 중이므로 재시작할 필요 없습니다.

## 📝 gRPC URL 형식 규칙

### ✅ 올바른 형식

```bash
# 로컬호스트
GRPC_URL=localhost:4001
GRPC_URL=127.0.0.1:4001
GRPC_URL=0.0.0.0:4001

# 원격 서버
GRPC_URL=my-server.example.com:50051
GRPC_URL=192.168.1.100:50051
```

### ❌ 잘못된 형식

```bash
# 프로토콜 포함 (HTTP/HTTPS)
GRPC_URL=http://localhost:4001      # ❌
GRPC_URL=https://localhost:4001     # ❌

# 슬래시 포함
GRPC_URL=localhost:4001/            # ❌
GRPC_URL=localhost:4001/api         # ❌
```

## 🔍 추가 디버깅

수정 후에도 문제가 계속되면:

### 1. Users 서비스 리스닝 확인

```bash
netstat -tulpn | grep 4001
# 또는
ss -tulpn | grep 4001
```

출력 예시:

```
tcp  0  0  0.0.0.0:4001  0.0.0.0:*  LISTEN  51059/node
```

### 2. SSL 인증서 확인

```bash
ls -la certs/
```

다음 파일들이 존재해야 합니다:

- `ca.crt`
- `server.key`, `server.crt`
- `client.key`, `client.crt`

### 3. 환경 변수 로드 확인

Auth 서비스 시작 시 로그에서 다음을 확인:

```
USERS_GRPC_TARGET_URL: 127.0.0.1:4001  # http:// 없어야 함
```

## 💡 참고 사항

- **gRPC는 항상 `host:port` 형식**을 사용합니다
- **SSL/TLS는 `credentials` 옵션**으로 별도 설정됩니다
- **URL에 프로토콜을 포함하면 DNS 해석 오류**가 발생합니다
- **`0.0.0.0`은 서버 바인딩용**, **`127.0.0.1` 또는 `localhost`는 클라이언트 연결용**입니다
