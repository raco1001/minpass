# OAuth 설정 가이드

이 가이드는 API Gateway에서 OAuth 소셜 로그인을 설정하는 방법을 설명합니다.

## 📋 목차

1. [환경변수 설정](#환경변수-설정)
2. [Google OAuth 설정](#google-oauth-설정)
3. [GitHub OAuth 설정](#github-oauth-설정)
4. [Kakao OAuth 설정](#kakao-oauth-설정)
5. [테스트](#테스트)
6. [문제 해결](#문제-해결)

---

## 환경변수 설정

### 1. .env 파일 생성

```bash
cd apps/apis
cp .env.example .env
```

### 2. 기본 설정

`.env` 파일을 열고 다음을 설정하세요:

```env
# 사용할 OAuth Provider 지정 (쉼표로 구분)
ENABLED_PROVIDERS=google,github,kakao

# 프론트엔드 URL (CORS 및 리디렉션에 사용)
FRONTEND_URL=http://localhost:5174

# OAuth Callback을 받을 API 서버 URL
REDIRECT_BASE_URL=http://localhost:3000
```

---

## Google OAuth 설정

### 1. Google Cloud Console에서 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 메뉴로 이동

### 2. OAuth 2.0 클라이언트 ID 생성

1. **"사용자 인증 정보 만들기"** 클릭
2. **"OAuth 클라이언트 ID"** 선택
3. 애플리케이션 유형: **"웹 애플리케이션"** 선택
4. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000/auth/login/google/callback
   ```
5. "만들기" 클릭 후 **Client ID**와 **Client Secret** 복사

### 3. .env 파일에 추가

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_PATH=/auth/login/google/callback
```

### 4. OAuth 동의 화면 설정 (필수)

1. "OAuth 동의 화면" 메뉴로 이동
2. 사용자 유형: **"외부"** 선택 (테스트용)
3. 앱 정보 입력:
   - 앱 이름
   - 사용자 지원 이메일
   - 개발자 연락처 정보
4. 범위 추가:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. 테스트 사용자 추가 (본인 이메일)

---

## GitHub OAuth 설정

### 1. GitHub OAuth App 생성

1. [GitHub Developer Settings](https://github.com/settings/developers) 접속
2. "OAuth Apps" 탭 선택
3. **"New OAuth App"** 클릭

### 2. App 정보 입력

```
Application name: MinPass (또는 원하는 이름)
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/auth/login/github/callback
```

### 3. Client ID와 Secret 복사

1. "Register application" 클릭
2. **Client ID** 복사
3. **"Generate a new client secret"** 클릭하여 Secret 생성 및 복사

### 4. .env 파일에 추가

```env
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_PATH=/auth/login/github/callback
```

---

## Kakao OAuth 설정

### 1. Kakao Developers 애플리케이션 생성

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. "내 애플리케이션" 메뉴로 이동
3. **"애플리케이션 추가하기"** 클릭
4. 앱 이름, 사업자명 입력 후 저장

### 2. 플랫폼 설정

1. 생성한 앱 선택
2. "플랫폼" > **"Web 플랫폼 등록"** 클릭
3. 사이트 도메인: `http://localhost:3000`

### 3. Redirect URI 설정

1. "제품 설정" > **"카카오 로그인"** 메뉴로 이동
2. "카카오 로그인 활성화" → **ON**
3. **"Redirect URI 등록"** 클릭
4. Redirect URI 추가:
   ```
   http://localhost:3000/auth/login/kakao/callback
   ```

### 4. 동의 항목 설정

1. "제품 설정" > **"카카오 로그인" > "동의항목"** 메뉴로 이동
2. 다음 항목을 **"필수 동의"**로 설정:
   - 닉네임
   - 카카오계정(이메일)

### 5. Client Secret 생성 (권장)

1. "보안" > **"Client Secret"** 메뉴로 이동
2. **"코드 생성"** 클릭
3. 활성화 상태를 **"사용함"**으로 설정
4. Secret 값 복사

### 6. .env 파일에 추가

```env
KAKAO_CLIENT_ID=your-kakao-rest-api-key
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_PATH=/auth/login/kakao/callback
```

**주의:** `KAKAO_CLIENT_ID`는 "앱 키" > **"REST API 키"**입니다.

---

## 테스트

### 1. 환경변수 확인

```bash
# 프로젝트 루트에서 실행
node apps/apis/check-env.js
```

**예상 출력:**

```
✅ All required environment variables are set!
```

### 2. 서버 시작

```bash
pnpm start:apis
```

**확인할 로그:**

```
[AuthProviderModule] ✅ Google OAuth configured
[AuthProviderModule] ✅ GitHub OAuth configured
[AuthProviderModule] ✅ Kakao OAuth configured
[AuthProviderModule] ✅ Total 3 OAuth provider(s) configured
[AuthProviderModule] ✅ Total 3 Passport strategy(ies) registered
[DynamicAuthGuard] ✅ Initialized with providers: google, github, kakao
```

### 3. 브라우저 테스트

각 provider 테스트:

```
http://localhost:3000/auth/login/google
http://localhost:3000/auth/login/github
http://localhost:3000/auth/login/kakao
```

**성공 시:** 각 provider의 로그인 페이지로 리디렉션됩니다.

---

## 문제 해결

### ❌ "No Passport strategies registered!"

**원인:** `ENABLED_PROVIDERS` 환경변수가 설정되지 않음

**해결:**

```env
ENABLED_PROVIDERS=google,github,kakao
```

### ❌ "Invalid OAuth provider"

**원인:** Provider 이름 대소문자 불일치 또는 오타

**해결:** 정확히 `google`, `github`, `kakao` 사용 (소문자)

### ❌ "Provider not found" 에러

**원인:** Client ID 또는 Secret이 잘못됨

**해결:**

1. OAuth Console에서 credentials 재확인
2. `.env` 파일에 정확히 복사했는지 확인
3. 공백이나 줄바꿈 문자가 없는지 확인

### ❌ "redirect_uri_mismatch" 에러

**원인:** Callback URL이 OAuth Console에 등록된 것과 다름

**해결:**

1. OAuth Console의 Redirect URI 확인:
   ```
   http://localhost:3000/auth/login/{provider}/callback
   ```
2. `.env`의 `REDIRECT_BASE_URL` 확인
3. 포트 번호가 일치하는지 확인

### 🔍 상세 디버깅

서버 시작 시 다음 로그들을 확인하세요:

```
📋 Environment ENABLED_PROVIDERS: google,github
🔧 Parsed enabled providers: google, github
🔵 Configuring Google OAuth provider
✅ Google OAuth configured - Callback: http://localhost:3000/...
📝 Strategies registration - Enabled: google, github
✅ GoogleStrategy registered
✅ Total 2 Passport strategy(ies) registered
```

각 단계에서 에러나 경고가 있으면 해당 설정을 재확인하세요.

---

## 프로덕션 배포 시 주의사항

### 1. HTTPS 사용

프로덕션에서는 반드시 HTTPS를 사용하세요:

```env
REDIRECT_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 2. OAuth Console에 프로덕션 URL 등록

각 OAuth Provider Console에서 프로덕션 Callback URL을 추가하세요:

```
https://api.yourdomain.com/auth/login/google/callback
https://api.yourdomain.com/auth/login/github/callback
https://api.yourdomain.com/auth/login/kakao/callback
```

### 3. 환경변수 관리

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션에서는 환경변수 관리 도구 사용 (AWS Secrets Manager, Vault 등)
- CI/CD 파이프라인에서 환경변수 주입

### 4. 보안 강화

```env
# HttpOnly 쿠키 사용
NODE_ENV=production

# Secure flag 자동 활성화됨
```

---

## 추가 리소스

- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth 문서](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Kakao Login 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Passport.js 문서](http://www.passportjs.org/docs/)

---

## 지원

문제가 있거나 도움이 필요하면 다음을 실행하여 환경 상태를 확인하세요:

```bash
# 환경변수 확인
node apps/apis/check-env.js

# 서버 로그 확인
pnpm start:apis
```

로그를 첨부하여 팀에 문의하세요.
