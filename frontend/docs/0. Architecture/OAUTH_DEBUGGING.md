# OAuth 403 Forbidden 에러 해결 가이드

## 🔴 문제

Google 로그인 버튼 클릭 시:

```json
{ "message": "Forbidden resource", "error": "Forbidden", "statusCode": 403 }
```

## ✅ 원인

백엔드의 `DynamicAuthGuard`가 요청을 차단하고 있습니다.

**Guard 작동 방식:**

1. URL에서 provider 파라미터 추출 (`google`)
2. `providerOptions` Map에서 해당 provider 확인
3. 없으면 403 Forbidden 반환

**403 에러가 발생하는 이유:**

- ❌ 환경변수가 제대로 로드되지 않음
- ❌ 백엔드 서버가 재시작되지 않음
- ❌ OAuth Provider 설정 누락

---

## 🛠️ 해결 방법

### 1단계: 백엔드 .env 파일 확인

```bash
cd /home/orca/devs/projects/minpass/backend/nestjs-msa
cat .env | grep -E "ENABLED_PROVIDERS|GOOGLE_CLIENT"
```

**필수 환경변수:**

```bash
# OAuth Provider 활성화
ENABLED_PROVIDERS=google,kakao,github

# Frontend URL
FRONTEND_URL=http://localhost:5174

# Redirect Base URL
REDIRECT_BASE_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**⚠️ 주의사항:**

- `ENABLED_PROVIDERS`에 **공백 없이** 쉼표로 구분: ✅ `google,kakao` ❌ `google, kakao`
- 모든 provider는 **소문자**여야 함

---

### 2단계: 백엔드 서버 재시작 (중요!)

환경변수를 변경했다면 **반드시 서버를 재시작**해야 합니다.

```bash
# 백엔드 디렉토리로 이동
cd /home/orca/devs/projects/minpass/backend/nestjs-msa

# 기존 서버 중지
# Ctrl+C 또는
pkill -f nest  # 또는 실행 중인 node 프로세스 종료

# 서버 재시작
npm run start:dev  # 또는 pnpm start:dev
```

**서버 시작 로그 확인:**
정상적으로 시작되면 다음과 같은 로그가 표시되어야 합니다:

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AuthProviderModule dependencies initialized
[Nest] INFO [RoutesResolver] AuthClientController {/auth}:
[Nest] INFO [RouterExplorer] Mapped {/auth/login/:provider, GET} route
[Nest] INFO [RouterExplorer] Mapped {/auth/login/:provider/callback, GET} route
```

---

### 3단계: OAuth Provider 설정 확인

#### Google OAuth 설정

1. **Google Cloud Console 접속**

   - <https://console.cloud.google.com/>

2. **프로젝트 선택 또는 생성**

3. **OAuth 동의 화면 설정**

   - 왼쪽 메뉴: APIs & Services → OAuth consent screen
   - User Type: External 선택
   - 앱 이름, 이메일 등 입력
   - Scopes: `email`, `profile` 추가

4. **OAuth 클라이언트 ID 생성**

   - 왼쪽 메뉴: Credentials → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Authorized redirect URIs 추가:

     ```
     http://localhost:3000/auth/login/google/callback
     ```

   - Create 버튼 클릭

5. **Client ID와 Secret 복사**

   - 생성된 클라이언트 ID와 Secret을 `.env` 파일에 추가:

     ```bash
     GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx
     ```

#### 일반적인 실수

❌ **잘못된 Redirect URI:**

```
# 백엔드 .env
REDIRECT_BASE_URL=http://localhost:3000  ✅

# Google Console Redirect URI
http://localhost:3000/auth/login/google/callback  ✅

# 잘못된 예시:
http://localhost:5174/auth/callback  ❌ (프론트엔드 URL)
http://localhost:3000/callback  ❌ (경로 틀림)
```

❌ **공백 포함:**

```bash
ENABLED_PROVIDERS=google, kakao, github  ❌
ENABLED_PROVIDERS=google,kakao,github    ✅
```

❌ **대문자 사용:**

```bash
ENABLED_PROVIDERS=GOOGLE,KAKAO,GITHUB  ❌
ENABLED_PROVIDERS=google,kakao,github  ✅
```

---

### 4단계: 테스트

```bash
# 1. 백엔드 엔드포인트 직접 테스트
curl -v http://localhost:3000/auth/login/google

# 성공 시: 302 Redirect (Google OAuth 페이지로)
# 실패 시: 403 Forbidden
```

**예상 결과 (성공):**

```
< HTTP/1.1 302 Found
< Location: https://accounts.google.com/o/oauth2/v2/auth?...
```

**예상 결과 (실패 - 여전히 403):**

```json
{ "message": "Forbidden resource", "error": "Forbidden", "statusCode": 403 }
```

---

## 🔍 추가 디버깅

### 백엔드 로그 확인

백엔드 서버 시작 시 다음을 확인:

```typescript
// auth-provider.module.ts의 assembleProviderOptions 함수
// 에러 로그를 추가하여 확인할 수 있습니다

console.log('ENABLED_PROVIDERS:', env.ENABLED_PROVIDERS)
console.log('Enabled set:', enabledSet)
console.log('Registered providers:', Array.from(providers.keys()))
```

**정상 출력:**

```
ENABLED_PROVIDERS: google,kakao,github
Enabled set: Set { 'google', 'kakao', 'github' }
Registered providers: [ 'google', 'kakao', 'github' ]
```

### 환경변수 디버깅

백엔드에서 환경변수가 제대로 로드되는지 확인:

```bash
cd /home/orca/devs/projects/minpass/backend/nestjs-msa

# Node.js에서 직접 확인
node -e "require('dotenv').config(); console.log(process.env.ENABLED_PROVIDERS)"
```

---

## ✅ 체크리스트

백엔드:

- [ ] `.env` 파일에 `ENABLED_PROVIDERS=google,kakao,github` 설정됨
- [ ] `.env` 파일에 `GOOGLE_CLIENT_ID` 설정됨
- [ ] `.env` 파일에 `GOOGLE_CLIENT_SECRET` 설정됨
- [ ] `.env` 파일에 `FRONTEND_URL=http://localhost:5174` 설정됨
- [ ] 백엔드 서버 재시작함
- [ ] 서버 시작 로그에 에러 없음

Google OAuth:

- [ ] Google Cloud Console에서 프로젝트 생성
- [ ] OAuth 동의 화면 설정 완료
- [ ] OAuth 클라이언트 ID 생성
- [ ] Redirect URI: `http://localhost:3000/auth/login/google/callback` 추가
- [ ] Client ID와 Secret을 `.env`에 복사

테스트:

- [ ] `curl http://localhost:3000/auth/login/google` → 302 Redirect
- [ ] 브라우저에서 "Google로 로그인" 클릭 → Google 로그인 페이지로 이동

---

## 🎯 가장 흔한 해결책

**99%의 경우 이것으로 해결됩니다:**

```bash
# 1. 백엔드 디렉토리로 이동
cd /home/orca/devs/projects/minpass/backend/nestjs-msa

# 2. 서버 중지 (Ctrl+C)

# 3. 서버 재시작
npm run start:dev  # 또는 pnpm start:dev

# 4. 프론트엔드에서 다시 테스트
```

**왜?**

- 환경변수는 서버 시작 시 한 번만 로드됩니다
- `.env` 파일 변경 후 **반드시 서버를 재시작**해야 합니다

---

## 🆘 여전히 문제가 있다면

다음 정보를 확인하고 공유해주세요:

1. **백엔드 서버 시작 로그** (전체)
2. **환경변수 확인:**

   ```bash
   cd /home/orca/devs/projects/minpass/backend/nestjs-msa
   cat .env | grep -E "ENABLED|GOOGLE|FRONTEND"
   ```

3. **curl 테스트 결과:**

   ```bash
   curl -v http://localhost:3000/auth/login/google 2>&1
   ```

4. **Google Cloud Console Redirect URI 설정** 스크린샷

---

## 📚 참고 자료

- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [NestJS Passport 문서](https://docs.nestjs.com/security/authentication)
- [Passport Google OAuth 전략](http://www.passportjs.org/packages/passport-google-oauth20/)
