# 🧩 Frontend Page Specification - Landing Page

> **Objective**: MinPass 서비스 소개 및 사용자 유입을 위한 메인 랜딩 페이지  
> **Representatives**: Front-End | Designer | Back-End  
> **Version**: v1.0  
> **Last Updated**: 2025-11-10  
> **Author**: Dane

---

## 1. Overview

| Items                    | Contents                                                           |
| ------------------------ | ------------------------------------------------------------------ |
| **Page Name**            | Landing Page (Main Page)                                           |
| **Route Path**           | `/`                                                                |
| **Layout Type**          | Standalone (No shared layout, includes own Header)                 |
| **Description**          | 서비스 소개, 주요 기능 안내, 회원가입 유도를 위한 메인 랜딩 페이지 |
| **Author / Last Update** | AI Assistant / 2025-11-10                                          |

---

## 2. Page Structure

```bash
LandingPage
 ├─ Header
 │   ├─ Logo (MinPass with icon)
 │   ├─ Navigation Menu
 │   │   ├─ Home
 │   │   ├─ About MinPass
 │   │   ├─ Features (Dropdown)
 │   │   │   ├─ Calendar
 │   │   │   ├─ Tasks
 │   │   │   └─ Ontology
 │   │   └─ Contact
 │   └─ Auth Buttons
 │       ├─ Sign In
 │       └─ Sign Up
 ├─ Hero Section
 │   ├─ Title ("Automated Productivity Feedback")
 │   ├─ Description
 │   ├─ CTA Buttons
 │   │   ├─ Get Started Free
 │   │   └─ Watch Demo
 │   └─ Visual Icon (Lightning bolt)
 ├─ Why MinPass Section
 │   ├─ Section Title
 │   └─ Features Grid (3 cards)
 │       ├─ Calendar Integration
 │       ├─ Task Management
 │       └─ Smart Analytics
 ├─ CTA Section
 │   ├─ Title ("Ready to transform your productivity?")
 │   ├─ Description
 │   └─ Start Free Trial Button
 └─ Footer
     └─ Copyright Notice
```

---

## 3. UI Components

| 컴포넌트          | 역할                          | 관련 파일                                       | Props / Interface | 연관 모듈    |
| ----------------- | ----------------------------- | ----------------------------------------------- | ----------------- | ------------ |
| Header            | 네비게이션 및 인증 버튼       | `src/widgets/header/ui/Header.tsx`              | -                 | useUserStore |
| Hero Section      | 서비스 소개 및 주요 CTA       | `src/pages/landing/ui/LandingPage.tsx` (inline) | -                 | -            |
| Feature Card      | 개별 기능 소개 카드           | `src/pages/landing/ui/LandingPage.tsx` (inline) | -                 | -            |
| CTA Section       | 하단 전환 유도 섹션           | `src/pages/landing/ui/LandingPage.tsx` (inline) | -                 | -            |
| Features Dropdown | 헤더의 Features 메뉴 드롭다운 | `src/widgets/header/ui/Header.tsx`              | -                 | React Router |

---

## 4. Feature Specification

| 기능                     | 설명                                       | 트리거 / 이벤트         | 상태 관리    | API 연동 |
| ------------------------ | ------------------------------------------ | ----------------------- | ------------ | -------- |
| 페이지 진입              | 랜딩 페이지 렌더링                         | 라우트 진입             | -            | None     |
| Get Started Free 클릭    | 로그인 페이지로 이동                       | `onClick` → `/login`    | -            | None     |
| Start Free Trial 클릭    | 로그인 페이지로 이동                       | `onClick` → `/login`    | -            | None     |
| Features 메뉴 호버       | 드롭다운 메뉴 표시                         | `onMouseEnter/Leave`    | Local state  | None     |
| Features > Calendar 클릭 | 캘린더 페이지로 이동                       | `onClick` → `/calendar` | -            | None     |
| Sign In / Sign Up 클릭   | 로그인 페이지로 이동                       | `onClick` → `/login`    | -            | None     |
| Logo 클릭                | 메인 페이지로 이동 (현재 페이지)           | `onClick` → `/`         | -            | None     |
| 로그인 상태 확인         | 로그인 시 Sign In/Up 대신 Logout 버튼 표시 | Header 렌더링           | useUserStore | None     |

---

## 5. Data Interface

```typescript
// No complex data structures - mostly static content
// User state is managed globally via Zustand

type User = {
  id: string
  email?: string
  name?: string
  isNewUser?: boolean
}

// Feature cards are hardcoded inline
interface FeatureCardData {
  icon: JSX.Element
  title: string
  description: string
}
```

---

## 6. Related Files

| 구분           | 파일 경로                                     | 설명                          |
| -------------- | --------------------------------------------- | ----------------------------- |
| Page Component | `src/pages/landing/ui/LandingPage.tsx`        | 랜딩 페이지 메인 컴포넌트     |
| Page Index     | `src/pages/landing/index.ts`                  | 페이지 export                 |
| Styles         | `src/pages/landing/ui/LandingPage.module.css` | 랜딩 페이지 전용 스타일       |
| Header Widget  | `src/widgets/header/ui/Header.tsx`            | 공유 헤더 컴포넌트            |
| Header Styles  | `src/widgets/header/ui/Header.module.css`     | 헤더 스타일                   |
| Header Index   | `src/widgets/header/index.ts`                 | 헤더 export                   |
| User Store     | `src/entities/users/model/user.store.ts`      | Zustand 사용자 상태 관리      |
| Router Config  | `src/app/routes.tsx`                          | 라우팅 설정                   |
| Global Styles  | `src/app/styles/index.css`                    | 전역 스타일 (리셋, 다크 테마) |

---

## 7. UX / UI Notes

### Design System

- **Color Scheme**: Dark theme (검정 배경 `#000`, 파란색 액센트 `#3b82f6`)
- **Typography**:
  - Hero Title: 4rem (64px), bold
  - Section Title: 3rem (48px), bold
  - Body Text: 0.95-1.125rem, regular
- **Spacing**: 일관된 섹션 간격 (6rem padding)

### Interactions

- **Hover Effects**: 부드러운 트랜지션 (0.2-0.3s)
  - 버튼: translateY 효과 및 그림자
  - 카드: translateY(-4px) 및 테두리 강조
- **Animations**:
  - Hero 아이콘: pulse 애니메이션 (3s loop)
  - Features 드롭다운: fadeIn 애니메이션 (0.15s)

### Responsive Design

- **Desktop**: 1280px max-width container
- **Tablet (≤1024px)**: Hero를 세로 배치, 그리드 → 1열
- **Mobile (≤768px)**:
  - 헤더 네비게이션 숨김
  - CTA 버튼 전체 너비
  - 텍스트 크기 축소

### Accessibility

- 시맨틱 HTML 태그 사용 (`<header>`, `<nav>`, `<section>`, `<footer>`)
- 키보드 네비게이션 지원 (탭 포커스)
- 충분한 색상 대비 (WCAG AA 준수)
- SVG 아이콘에 의미있는 구조

---

## 8. Dependency & Integration

| 항목              | 설명                                        |
| ----------------- | ------------------------------------------- |
| Global Store      | `useUserStore()` - 로그인 상태 확인         |
| Shared Components | Header 위젯 재사용                          |
| Routing           | React Router DOM v7 (`Link`, `useNavigate`) |
| Styling           | CSS Modules (`.module.css`)                 |
| External Library  | None (순수 React + React Router)            |
| Backend API Spec  | N/A (정적 페이지, API 호출 없음)            |

---

## 9. Open Issues / TODO

| 항목                      | 상태    | 담당자        | 비고                             |
| ------------------------- | ------- | ------------- | -------------------------------- |
| Watch Demo 버튼 기능 구현 | ⚪ 예정 | Frontend Team | 데모 비디오 또는 튜토리얼 연결   |
| About MinPass 페이지 구현 | ⚪ 예정 | Frontend Team | 서비스 상세 소개 페이지          |
| Contact 페이지 구현       | ⚪ 예정 | Frontend Team | 문의 폼 또는 연락처 정보         |
| SEO 메타 태그 추가        | ⚪ 예정 | Frontend Team | title, description, OG tags      |
| 다국어 지원 (i18n)        | ⚪ 예정 | Frontend Team | 한국어/영어 전환                 |
| 모바일 햄버거 메뉴        | ⚪ 예정 | Frontend Team | 768px 이하에서 네비게이션 접근성 |

---

## 10. Change Log

| 버전 | 일자       | 변경 내용                                      | 작성자       |
| ---- | ---------- | ---------------------------------------------- | ------------ |
| v1.0 | 2025-11-10 | 최초 작성 - Hero, Why MinPass, CTA 섹션 구현   | AI Assistant |
| v1.0 | 2025-11-10 | Header 컴포넌트 분리 및 Features 드롭다운 구현 | AI Assistant |
| v1.0 | 2025-11-10 | 다크 테마 디자인 적용                          | AI Assistant |

---

## 11. References

### Design Inspiration

- Modern SaaS landing pages (Vercel, Linear, Notion)
- Dark mode best practices

### Technical Documentation

- [React Router DOM v7](https://reactrouter.com/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [Feature-Sliced Design](https://feature-sliced.design/)

### Internal Links

- Header Widget: `docs/2. Widgets/header.md` (TBD)
- Routing: `docs/0. Architecture/routing.md` (TBD)
- User Store: `docs/3. Entities/user-store.md` (TBD)

---

## 12. Screenshots & Visual Reference

### Hero Section

### Hero Section

![Hero](./images/main1.png)

### Why MinPass Section

![Why MinPass](./images/main2.png)
![Footer](./images/footer.png)

---

## 13. Testing Checklist

- [ ] 모든 링크가 올바른 경로로 이동하는지 확인
- [ ] Features 드롭다운이 호버 시 부드럽게 나타나는지 확인
- [ ] 드롭다운에서 마우스 이동 시 메뉴가 유지되는지 확인
- [ ] 로그인 상태에 따라 버튼이 올바르게 변경되는지 확인
- [ ] 반응형 디자인이 모바일/태블릿에서 작동하는지 확인
- [ ] 모든 애니메이션이 부드럽게 작동하는지 확인
- [ ] 키보드 네비게이션이 작동하는지 확인
- [ ] 다크 테마가 일관되게 적용되는지 확인
