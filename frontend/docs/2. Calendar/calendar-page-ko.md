# 🧩 Frontend Page Specification - Calendar Page

> **Objective**: Google Calendar 연동 기반 일정 관리 및 시각화 페이지  
> **Representatives**: Front-End | Designer | Back-End  
> **Version**: v1.0  
> **Last Updated**: 2025-11-10  
> **Author**: AI Assistant

---

## 1. Overview

| Items                    | Contents                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **Page Name**            | Calendar Page                                                                      |
| **Route Path**           | `/calendar`                                                                        |
| **Layout Type**          | Dashboard Layout (Header + Sidebar + Main Content)                                 |
| **Description**          | Google Calendar API 기반 일정 조회, 생성, 수정, 삭제 기능을 제공하는 캘린더 페이지 |
| **Author / Last Update** | AI Assistant / 2025-11-10                                                          |

---

## 2. Page Structure

```bash
CalendarPage
 ├─ Header (Global)
 │   ├─ Logo → Home
 │   ├─ Navigation Menu
 │   └─ Logout Button
 ├─ CalendarSidebar (Collapsible)
 │   ├─ Toggle Button
 │   └─ Navigation Items
 │       ├─ Calendar (Active)
 │       ├─ Tasks
 │       ├─ Ontology
 │       └─ Statistics
 └─ Main Content Area
     ├─ CalendarHeader
     │   ├─ Title & Description
     │   ├─ Date Range Display
     │   ├─ Navigation Controls (Prev/Next)
     │   ├─ View Selector (Day/Week/Month)
     │   └─ Keyboard Hint
     └─ CalendarView
         ├─ MonthView (Grid layout)
         ├─ WeekView (Timeline layout)
         └─ DayView (Single day timeline)
```

---

## 3. UI Components

| 컴포넌트        | 역할                         | 관련 파일                                             | Props / Interface       | 연관 모듈         |
| --------------- | ---------------------------- | ----------------------------------------------------- | ----------------------- | ----------------- |
| CalendarPage    | 페이지 루트 컴포넌트         | `src/pages/calendar/ui/CalendarPage.tsx`              | -                       | useCalendarEvents |
| Header          | 전역 헤더 (네비게이션, 인증) | `src/widgets/header/ui/Header.tsx`                    | -                       | useUserStore      |
| CalendarSidebar | 접이식 사이드 네비게이션     | `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` | isCollapsed, onToggle   | React Router      |
| CalendarView    | 캘린더 뷰 컨테이너           | `src/widgets/calendar-view/ui/CalendarView.tsx`       | events: CalendarEvent[] | date-fns          |
| CalendarHeader  | 캘린더 제목 및 컨트롤        | `src/widgets/calendar-view/ui/CalendarHeader.tsx`     | currentDate, view, etc. | -                 |
| MonthView       | 월간 캘린더 그리드           | `src/widgets/calendar-view/ui/MonthView.tsx`          | currentDate, events     | date-fns          |
| WeekView        | 주간 타임라인 뷰             | `src/widgets/calendar-view/ui/WeekView.tsx`           | currentDate, events     | date-fns          |
| DayView         | 일간 타임라인 뷰             | `src/widgets/calendar-view/ui/DayView.tsx`            | currentDate, events     | date-fns          |

---

## 4. Feature Specification

| 기능                  | 설명                                        | 트리거 / 이벤트        | 상태 관리    | API 연동                 |
| --------------------- | ------------------------------------------- | ---------------------- | ------------ | ------------------------ |
| 페이지 진입           | SessionGuard 인증 후 캘린더 렌더링          | 라우트 진입            | useUserStore | GET /api/calendar/events |
| 일정 조회             | Mock/실제 API에서 일정 데이터 로드          | useQuery (React Query) | Query cache  | GET /api/calendar/events |
| 뷰 전환               | Day/Week/Month 뷰 변경                      | Select onChange        | Local state  | None                     |
| 이전/다음 기간 이동   | 날짜 범위 이동 (Day ±1, Week ±7, Month ±30) | Button onClick         | Local state  | None                     |
| 키보드 네비게이션     | 좌우 화살표 키로 기간 이동                  | window keydown event   | Local state  | None                     |
| 사이드바 토글         | 사이드바 접기/펼치기                        | Button onClick         | Local state  | None                     |
| 사이드바 네비게이션   | Tasks/Ontology/Statistics 페이지 이동       | Link onClick           | -            | None                     |
| 새로고침 시 인증 유지 | localStorage 토큰으로 사용자 정보 복원      | SessionGuard useQuery  | useUserStore | GET /api/users/me        |

---

## 5. Data Interface

```typescript
// Calendar Event
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  color?: string
  allDay?: boolean
}

// Task (future use)
interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
}

// Calendar View Type
type CalendarView = 'day' | 'week' | 'month'

// Calendar State
interface CalendarState {
  currentDate: Date
  view: CalendarView
  events: CalendarEvent[]
  tasks: Task[]
}

// API Response
interface CalendarEventsResponse {
  events: CalendarEvent[]
}

interface CalendarTasksResponse {
  tasks: Task[]
}
```

---

## 6. Related Files

| 구분            | 파일 경로                                                    | 설명                      |
| --------------- | ------------------------------------------------------------ | ------------------------- |
| Page Component  | `src/pages/calendar/ui/CalendarPage.tsx`                     | 캘린더 페이지 루트        |
| Page Index      | `src/pages/calendar/index.ts`                                | 페이지 export             |
| Page Styles     | `src/pages/calendar/ui/CalendarPage.module.css`              | 페이지 레이아웃 스타일    |
| Sidebar Widget  | `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx`        | 사이드바 컴포넌트         |
| Sidebar Styles  | `src/widgets/calendar-sidebar/ui/CalendarSidebar.module.css` | 사이드바 스타일           |
| Calendar View   | `src/widgets/calendar-view/ui/CalendarView.tsx`              | 뷰 컨테이너               |
| Calendar Header | `src/widgets/calendar-view/ui/CalendarHeader.tsx`            | 헤더 컴포넌트             |
| Month View      | `src/widgets/calendar-view/ui/MonthView.tsx`                 | 월간 뷰                   |
| Week View       | `src/widgets/calendar-view/ui/WeekView.tsx`                  | 주간 뷰                   |
| Day View        | `src/widgets/calendar-view/ui/DayView.tsx`                   | 일간 뷰                   |
| Calendar Types  | `src/entities/calendar/model/calendar.types.ts`              | 캘린더 타입 정의          |
| Calendar Hook   | `src/features/calendar/model/useCalendarEvents.ts`           | React Query 훅            |
| Calendar API    | `src/shared/apis/calendar.api.ts`                            | API 함수                  |
| Mock Data       | `src/shared/mocks/data/calendar.mock.ts`                     | Mock 이벤트/태스크 데이터 |
| Mock Handlers   | `src/shared/mocks/handlers/calendar.handlers.ts`             | MSW 핸들러                |
| Session Guard   | `src/features/session/ui/SessionGuard.tsx`                   | 인증 가드                 |
| Router Config   | `src/app/routes.tsx`                                         | 라우팅 설정               |

---

## 7. UX / UI Notes

### Design System

- **Color Scheme**: Dark theme (검정 배경, 파란색 액센트)
- **Typography**:
  - Page Title: 2rem, bold
  - Date Range: 1.5rem, semi-bold
  - Event Text: 0.75-0.875rem
- **Layout**:
  - Header: Fixed, 65px height
  - Sidebar: 200px width (collapsed: 60px)
  - Main: Flexible, scrollable

### Interactions

- **View Switching**: 드롭다운 셀렉터로 부드러운 전환
- **Keyboard Navigation**:
  - `←` : 이전 기간
  - `→` : 다음 기간
  - 입력 필드 포커스 시 비활성화
- **Sidebar Toggle**:
  - 우측 상단 토글 버튼
  - 애니메이션 (0.3s transition)
- **Event Hover**:
  - 색상 강조
  - translateX(2-4px) 효과

### Calendar Views

#### Month View

- 7x6 그리드 레이아웃
- 이벤트 최대 3개 표시 (+N more)
- 오늘 날짜 하이라이트
- 다른 달 날짜 투명도 조정

#### Week View

- 시간대별 타임라인 (24시간)
- 좌측에 시간 레이블 (1 AM - 12 PM)
- 요일별 컬럼
- 스크롤 가능

#### Day View

- 단일 날짜 타임라인
- 시간대별 이벤트 상세 표시
- 이벤트 설명 전체 표시

### Responsive Design

- **Desktop**: 최적화된 레이아웃
- **Tablet (≤1024px)**: 정상 작동
- **Mobile (≤768px)**: 사이드바 기본 숨김 (TBD)

### Accessibility

- 키보드 네비게이션 전체 지원
- 명확한 포커스 인디케이터
- 시맨틱 HTML 구조
- 스크린 리더 고려 (future)

---

## 8. Dependency & Integration

| 항목             | 설명                                          |
| ---------------- | --------------------------------------------- |
| Global Store     | `useUserStore()` - 사용자 인증 상태           |
| State Management | React Query - 서버 상태 캐싱                  |
| Date Library     | `date-fns` - 날짜 계산 및 포맷팅              |
| Routing          | React Router DOM v7                           |
| Styling          | CSS Modules                                   |
| Mock API         | MSW (Mock Service Worker)                     |
| HTTP Client      | Axios (with interceptors)                     |
| Backend API Spec | `/api/calendar/events`, `/api/calendar/tasks` |

### Mock API Endpoints (Development)

```typescript
GET    /api/calendar/events  → { events: CalendarEvent[] }
GET    /api/calendar/tasks   → { tasks: Task[] }
POST   /api/calendar/events  → { event: CalendarEvent }
PUT    /api/calendar/events/:id → { event: CalendarEvent }
DELETE /api/calendar/events/:id → { success: boolean }
GET    /api/users/me         → { user: AuthUser }
```

---

## 9. Open Issues / TODO

| 항목                     | 상태    | 담당자        | 비고                          |
| ------------------------ | ------- | ------------- | ----------------------------- |
| Drag & Drop 이벤트 이동  | ⚪ 예정 | Frontend Team | @dnd-kit 라이브러리 활용      |
| 이벤트 생성 모달         | ⚪ 예정 | Frontend Team | 날짜 클릭 시 모달 표시        |
| 이벤트 수정/삭제 기능    | ⚪ 예정 | Frontend Team | 이벤트 클릭 시 상세 보기/편집 |
| Task 통합 표시           | ⚪ 예정 | Frontend Team | 캘린더에 Task 함께 표시       |
| Google Calendar API 연동 | ⚪ 예정 | Backend Team  | Mock API → 실제 API 교체      |
| 반복 이벤트 지원         | ⚪ 예정 | Full Stack    | Recurring event 처리          |
| 캘린더 공유 기능         | ⚪ 예정 | Full Stack    | 팀 캘린더 공유                |
| 모바일 최적화            | ⚪ 예정 | Frontend Team | 터치 제스처, 햄버거 메뉴      |
| 오프라인 모드            | ⚪ 예정 | Frontend Team | Service Worker 캐싱           |
| 이벤트 검색/필터링       | ⚪ 예정 | Frontend Team | 검색바, 카테고리 필터         |

---

## 10. Change Log

| 버전 | 일자       | 변경 내용                                        | 작성자       |
| ---- | ---------- | ------------------------------------------------ | ------------ |
| v1.0 | 2025-11-10 | 최초 작성 - Month/Week/Day 뷰 구현               | AI Assistant |
| v1.0 | 2025-11-10 | 사이드바 네비게이션 추가                         | AI Assistant |
| v1.0 | 2025-11-10 | Mock API 및 React Query 연동                     | AI Assistant |
| v1.0 | 2025-11-10 | 키보드 네비게이션 (화살표 키) 구현               | AI Assistant |
| v1.0 | 2025-11-10 | SessionGuard 인증 플로우 개선 (새로고침 시 유지) | AI Assistant |

---

## 11. References

### Design Inspiration

- Google Calendar
- Microsoft Outlook Calendar
- Notion Calendar

### Technical Documentation

- [date-fns Documentation](https://date-fns.org/)
- [React Query v5](https://tanstack.com/query/latest)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [@dnd-kit Documentation](https://docs.dndkit.com/)

### Internal Links

- Landing Page: `docs/1. Mainpage/landing-page-ko.md`
- Header Widget: `docs/2. Widgets/header.md` (TBD)
- Session Guard: `docs/3. Features/session-guard.md` (TBD)
- Mock API Setup: `docs/0. Architecture/mock-api.md` (TBD)

---

## 12. Screenshots & Visual Reference

### Calendar Page Layout

```
┌───────────────────────────────────────────────────────────────┐
│ MinPass  Home  About  Features▼  Contact         [Logout]     │
├────┬──────────────────────────────────────────────────────────┤
│ [◀]│ Calendar                                    2025년 11월  │
│    │ Direct CRUD operations on your Google Calendar via API  │
│ 📅 │                                                           │
│ Cal│                    [◀] [▶]  [Day/Week/Month ▼]          │
│    │ Use ← → arrow keys to navigate                          │
│ ✓  ├───────────────────────────────────────────────────────┤
│ Tsk│ Sun  Mon  Tue  Wed  Thu  Fri  Sat                      │
│    ├───────────────────────────────────────────────────────┤
│ ⚡ │  2    3    4    5    6    7    8                       │
│ Ont│ [Event][Event]    [Event]                              │
│    │                                                          │
│ 📊 │  9   10   11   12   13   14   15                       │
│ Sta│           [Event]                                       │
│    │                                                          │
│    │ 16   17   18   19   20   21   22                       │
│    │                                                          │
└────┴──────────────────────────────────────────────────────────┘
```

### Week View Layout

```
┌─────────────────────────────────────────────────────────────┐
│        Sun    Mon    Tue    Wed    Thu    Fri    Sat        │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────────┤
│ 1 AM │      │      │      │      │      │      │           │
│ 2 AM │      │      │      │      │      │      │           │
│ 3 AM │      │      │      │      │      │      │           │
│...   │      │      │[Event]     │      │      │           │
│10 AM │      │[Event]      │      │[Event]     │           │
│...   │      │      │      │      │      │      │           │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────────┘
```

---

## 13. Testing Checklist

### Functionality

- [ ] 페이지 로드 시 이벤트가 올바르게 표시되는지 확인
- [ ] Day/Week/Month 뷰 전환이 정상 작동하는지 확인
- [ ] 이전/다음 버튼으로 날짜 이동이 작동하는지 확인
- [ ] 키보드 화살표 키 네비게이션 작동 확인
- [ ] 사이드바 토글 버튼이 정상 작동하는지 확인
- [ ] 사이드바 메뉴 링크가 올바른 페이지로 이동하는지 확인
- [ ] 새로고침 후 로그인 상태가 유지되는지 확인

### UI/UX

- [ ] 모든 뷰에서 이벤트가 올바르게 렌더링되는지 확인
- [ ] 호버 효과가 부드럽게 작동하는지 확인
- [ ] 로딩 상태가 명확하게 표시되는지 확인
- [ ] 다크 테마가 일관되게 적용되는지 확인
- [ ] 오늘 날짜가 명확하게 표시되는지 확인

### Performance

- [ ] 대용량 이벤트 데이터 렌더링 성능 확인
- [ ] 뷰 전환 시 렉이 없는지 확인
- [ ] React Query 캐싱이 정상 작동하는지 확인

### Accessibility

- [ ] 키보드만으로 전체 네비게이션 가능한지 확인
- [ ] 포커스 인디케이터가 명확한지 확인
- [ ] 색상 대비가 충분한지 확인
