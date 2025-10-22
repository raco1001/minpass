# JWT 환경 변수 불일치 수정 요약

## 🔍 문제 분석

### 발생한 에러

```
TypeError: Cannot read properties of undefined (reading 'sign')
at TokensUtil.generateToken
```

### 근본 원인

**환경 변수 이름 불일치:**

| 위치                 | 코드에서 사용           | .env 파일                 |
| -------------------- | ----------------------- | ------------------------- |
| Refresh Token Secret | `JWT_REFRESH_SECRET` ❌ | `REFRESH_TOKEN_SECRET` ✅ |
| JWT Expiration       | `JWT_EXPIRATION` ✅     | 누락 ❌                   |

## ✅ 해결 방법

### 1. `tokens.util.ts` 수정

**수정 전:**

```typescript
const token: string = this.jwtService.sign(payload, {
  secret: isAccessToken
    ? this.configService.get("JWT_SECRET")
    : this.configService.get("JWT_REFRESH_SECRET"), // ❌ 잘못된 변수명
  expiresIn: isAccessToken ? 3600 : 7 * 24 * 3600,
});
```

**수정 후:**

```typescript
const secret = isAccessToken
  ? this.configService.get("JWT_SECRET")
  : this.configService.get("REFRESH_TOKEN_SECRET"); // ✅ 올바른 변수명

const expiresIn = isAccessToken
  ? this.configService.get("JWT_EXPIRATION", "15m")
  : this.configService.get("REFRESH_TOKEN_EXPIRATION", "7d");

const token: string = this.jwtService.sign(payload, {
  secret,
  expiresIn,
});
```

**개선 사항:**

- ✅ 환경 변수 이름을 `.env` 파일과 일치시킴
- ✅ 만료 시간을 하드코딩에서 환경 변수로 변경
- ✅ 기본값 추가 (변수가 없을 경우 대비)

### 2. `jwt.config.ts` 수정

**수정 전:**

```typescript
export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION,
}));
```

**수정 후:**

```typescript
export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION || "15m", // ✅ 기본값 추가
}));
```

### 3. `apps/auth/.env` 업데이트

**추가된 변수:**

```bash
JWT_EXPIRATION=15m  # ← 새로 추가
```

**최종 JWT 설정:**

```bash
JWT_SECRET=thisisaccess-dev-secret-please-change-in-production
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=thisisrefresh-dev-secret-please-change-in-production
REFRESH_TOKEN_EXPIRATION=7d
```

## 📊 환경 변수 매핑표

| 용도                    | 환경 변수 이름             | 기본값 | 위치           |
| ----------------------- | -------------------------- | ------ | -------------- |
| 액세스 토큰 시크릿      | `JWT_SECRET`               | -      | apps/auth/.env |
| 액세스 토큰 만료 시간   | `JWT_EXPIRATION`           | `15m`  | apps/auth/.env |
| 리프레시 토큰 시크릿    | `REFRESH_TOKEN_SECRET`     | -      | apps/auth/.env |
| 리프레시 토큰 만료 시간 | `REFRESH_TOKEN_EXPIRATION` | `7d`   | apps/auth/.env |

## 🔧 적용 방법

### 코드 변경 사항

1. ✅ `apps/auth/src/infrastructure/tokens/tokens.util.ts`
2. ✅ `apps/auth/src/infrastructure/tokens/jwt.config.ts`
3. ✅ `apps/auth/.env`

### Auth 서비스 재시작

```bash
# 현재 실행 중인 auth 서비스 중지 (Ctrl+C)
pnpm start:auth
```

## 🎯 검증

### 예상 결과

```
✅ Auth 서비스 시작 성공
✅ Users 서비스 gRPC 연결 성공
✅ OAuth 로그인 → JWT 토큰 생성 성공
```

### 로그 확인

**이전 (에러):**

```
TypeError: Cannot read properties of undefined (reading 'sign')
```

**이후 (성공):**

```
(로그인 성공, JWT 토큰 생성됨)
```

## 📝 주의사항

### 운영 환경

- `JWT_SECRET`과 `REFRESH_TOKEN_SECRET`은 **강력한 랜덤 값**으로 변경 필수
- 최소 32자 이상 권장
- 각 환경(dev/staging/prod)마다 다른 값 사용

### 토큰 만료 시간 권장값

| 환경 | 액세스 토큰 | 리프레시 토큰 |
| ---- | ----------- | ------------- |
| 개발 | 1h ~ 1d     | 30d           |
| 운영 | 15m ~ 1h    | 7d ~ 30d      |

### 환경 변수 이름 규칙

앞으로 환경 변수를 추가할 때:

1. 코드와 `.env` 파일의 변수명을 **정확히 일치**시킬 것
2. `ConfigService.get()`에 **기본값** 제공 권장
3. `.env.example`에도 추가하여 템플릿 유지

## 🚀 다음 단계

1. Auth 서비스 재시작
2. OAuth 로그인 테스트
3. JWT 토큰이 정상적으로 생성되는지 확인
4. 프론트엔드에서 로그인 성공 확인

## 🔗 관련 파일

- **환경 변수 구조**: `ENV_STRUCTURE.md`
- **설정 검증**: `./scripts/verify-config.sh`
- **문제 해결**: `TROUBLESHOOTING.md`


