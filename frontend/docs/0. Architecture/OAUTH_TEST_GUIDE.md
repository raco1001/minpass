# OAuth 로그인 테스트 가이드

## 📋 사전 준비

### 백엔드 설정 확인

1. **환경변수 설정**

   ```bash
   FRONTEND_URL=http://localhost:5174
   ```

2. **OAuth Provider 설정**

   - Google Cloud Console에서 Client ID, Secret 발급
   - Redirect URI: `http://localhost:3000/auth/login/google/callback`

3. **CORS 설정 확인**

   ```typescript
   // NestJS 예시
   app.enableCors({
     origin: 'http://localhost:5174',
     credentials: true,
   })
   ```

4. **백엔드 서버 실행**
   ```bash
   # 백엔드 디렉토리에서
   npm run dev  # 또는 해당 명령어
   ```
   - 서버가 http://localhost:3000 에서 실행되는지 확인

### 프론트엔드 설정 확인

1. **.env 파일 확인**

   ```bash
   cat .env
   # 출력: VITE_API_URL=http://localhost:3000
   ```

2. **프론트엔드 서버 실행**
   ```bash
   pnpm dev
   ```
   - 서버가 http://localhost:5174 에서 실행되는지 확인

---

## ✅ 테스트 시나리오

### 1. 기본 OAuth 로그인 플로우

**단계:**

1. 브라우저에서 `http://localhost:5174/login` 접속
2. "Google로 로그인" 버튼 클릭
3. Google 로그인 페이지로 리디렉션 확인
4. Google 계정으로 로그인
5. 백엔드 콜백 처리 후 프론트엔드로 리턴
6. 대시보드(`/`)로 리디렉션 확인

**예상 결과:**

- ✅ Google 로그인 페이지가 새 창이 아닌 현재 창에서 열림
- ✅ 로그인 성공 시 대시보드로 이동
- ✅ 사용자 정보가 화면에 표시됨

**디버깅:**

```javascript
// 브라우저 콘솔에서 확인
console.log('Token:', localStorage.getItem('accessToken'))
console.log('User ID:', localStorage.getItem('userId'))
```

---

### 2. 로그인 후 페이지 복귀

**단계:**

1. 로그아웃 상태에서 `http://localhost:5174/` 접속
2. SessionGuard에 의해 `/login`으로 리디렉션됨
3. "Google로 로그인" 클릭
4. 로그인 완료 후 원래 페이지(`/`)로 복귀 확인

**예상 결과:**

- ✅ 로그인 후 `/login`이 아닌 원래 페이지로 이동

**디버깅:**

```javascript
// 로그인 버튼 클릭 전 콘솔에서 확인
console.log('Return URL:', localStorage.getItem('returnUrl'))
// 예상 출력: "/"
```

---

### 3. 에러 처리

#### 3.1 백엔드 서버 다운

**단계:**

1. 백엔드 서버 중지
2. "Google로 로그인" 클릭
3. 에러 처리 확인

**예상 결과:**

- ✅ 백엔드로 리디렉션 시도 → 연결 실패
- ✅ 사용자는 에러 페이지 또는 브라우저 에러 확인

#### 3.2 잘못된 토큰

**단계:**

1. 브라우저에서 직접 접속:
   ```
   http://localhost:5174/auth/callback?token=invalid&userId=123
   ```
2. 에러 메시지 표시 확인
3. 2초 후 `/login`으로 리디렉션 확인

**예상 결과:**

- ✅ "로그인 처리 중 오류가 발생했습니다." 메시지 표시
- ✅ 2초 후 로그인 페이지로 이동

---

### 4. 다중 Provider 테스트

**단계:**

1. "Google로 로그인" 테스트
2. 로그아웃
3. "GitHub으로 로그인" 테스트
4. 로그아웃
5. "Kakao로 로그인" 테스트

**예상 결과:**

- ✅ 각 Provider별로 올바른 OAuth 페이지로 리디렉션
- ✅ 모든 Provider로 로그인 성공

---

## 🔍 네트워크 검증

### Chrome DevTools 확인

1. **F12** → **Network** 탭 열기
2. "Google로 로그인" 클릭 후 네트워크 요청 확인

**예상 요청 흐름:**

```
1. http://localhost:3000/auth/login/google (302 Redirect)
   ↓
2. https://accounts.google.com/o/oauth2/v2/auth?... (Google)
   ↓
3. http://localhost:3000/auth/login/google/callback?code=... (백엔드)
   ↓
4. http://localhost:5174/auth/callback?token=xxx&userId=xxx (프론트엔드)
   ↓
5. http://localhost:3000/auth/me (GET, 사용자 정보 조회)
   Headers: Authorization: Bearer {token}
   또는 Cookie: {sessionCookie}
```

### CORS 에러가 없어야 함

- ❌ **이전**: `Access to XMLHttpRequest ... has been blocked by CORS policy`
- ✅ **현재**: CORS 에러 없음 (전체 페이지 리디렉션 사용)

---

## 🐛 트러블슈팅

### 1. "404 Not Found" 에러

**문제:** `POST http://localhost:3000/auth/login/google net::ERR_FAILED 404`

**원인:**

- ❌ 이전 코드가 아직 실행되고 있음 (axios POST 요청)
- 브라우저 캐시 문제

**해결:**

```bash
# 프론트엔드 서버 재시작
pkill -f vite  # 또는 Ctrl+C
pnpm dev
```

```javascript
// 브라우저에서 하드 리프레시
Ctrl + Shift + R  # Windows/Linux
Cmd + Shift + R   # Mac
```

### 2. "CORS 에러" 여전히 발생

**문제:** `Access to XMLHttpRequest ... has been blocked by CORS policy`

**원인:**

- 백엔드 CORS 설정 누락
- 잘못된 origin 설정

**해결:**

```typescript
// 백엔드 CORS 설정 확인
app.enableCors({
  origin: 'http://localhost:5174', // ← 정확한 프론트엔드 URL
  credentials: true,
})
```

### 3. 로그인 성공했지만 사용자 정보 없음

**문제:** `/auth/me` 요청이 401 Unauthorized 반환

**원인:**

- JWT 토큰이 제대로 전달되지 않음
- HttpOnly 쿠키가 설정되지 않음

**디버깅:**

```javascript
// 콘솔에서 확인
console.log('Token:', localStorage.getItem('accessToken'))

// Network 탭에서 /auth/me 요청의 Headers 확인
// Authorization: Bearer {token} 헤더가 있는지 확인
// 또는 Cookie 헤더가 있는지 확인
```

**해결:**

- JWT 방식: localStorage에 토큰이 저장되었는지 확인
- 쿠키 방식: 백엔드에서 `httpOnly: true, sameSite: 'lax'` 설정 확인

### 4. 무한 리디렉션 루프

**문제:** `/login` ↔ `/` 사이에서 무한 반복

**원인:**

- SessionGuard가 사용자를 인증하지 못함
- `/auth/me` 요청 실패

**디버깅:**

```javascript
// SessionGuard가 호출되는지 확인
// React DevTools → Components → SessionGuard
```

**해결:**

- 백엔드 `/auth/me` 엔드포인트 정상 작동 확인
- 토큰/쿠키가 올바르게 전달되는지 확인

---

## ✅ 성공 기준

- [ ] "Google로 로그인" 클릭 시 Google 로그인 페이지로 이동
- [ ] Google 로그인 완료 후 프론트엔드로 리턴
- [ ] 대시보드에 사용자 정보 표시
- [ ] CORS 에러 없음
- [ ] 404 에러 없음
- [ ] 로그인 후 원래 페이지로 복귀
- [ ] 로그아웃 후 재로그인 가능

---

## 📞 추가 지원

문제가 계속되면 다음 정보와 함께 문의하세요:

1. 브라우저 콘솔 에러 메시지
2. Network 탭 스크린샷
3. 백엔드 로그
4. localStorage 내용 (`console.log(localStorage)`)
