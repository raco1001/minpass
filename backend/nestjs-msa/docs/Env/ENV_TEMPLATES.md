# 환경 변수 템플릿

## apps/auth/.env.example

```bash
# Auth Microservice Configuration
AUTH_GRPC_BIND_URL=0.0.0.0:4002

# JWT Token Configuration
JWT_SECRET=your-strong-access-token-secret-here-min-32-chars
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your-strong-refresh-token-secret-here-min-32-chars
REFRESH_TOKEN_EXPIRATION=7d

# gRPC Client Configuration
USERS_GRPC_TARGET_URL=127.0.0.1:4001

# Optional Settings
PASSWORD_SALT_ROUNDS=10
TOKEN_CLEANUP_INTERVAL=3600000
```

## apps/users/.env.example

```bash
# Users Microservice Configuration
USERS_GRPC_BIND_URL=0.0.0.0:4001

# Optional Settings
USER_CACHE_TTL=300
MAX_USERS_PER_QUERY=100
```

## 루트 .env.example

```bash
# Node Environment
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# Database Configuration
DB_NAME=minpass
DB_HOST=127.0.0.1
DB_PORT=3307

DB_USER_SCHEMA_NAME=svc-user
DB_USER_SCHEMA_PASSWORD=user
DB_AUTH_SCHEMA_NAME=svc-auth
DB_AUTH_SCHEMA_PASSWORD=auth

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j
NEO4J_DATABASE=neo4j

# SSL/TLS Certificates
CA_CERT_PATH=certs/ca.crt
SERVER_KEY_PATH=certs/server.key
SERVER_CERT_PATH=certs/server.crt
CLIENT_KEY_PATH=certs/client.key
CLIENT_CERT_PATH=certs/client.crt
```
