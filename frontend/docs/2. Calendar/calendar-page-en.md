# 🧩 Frontend Page Specification - Calendar Page

> **Objective**: Schedule management and visualization page with Google Calendar integration  
> **Representatives**: Front-End | Designer | Back-End  
> **Version**: v1.0  
> **Last Updated**: 2025-11-10  
> **Author**: AI Assistant

---

## 1. Overview

| Items                    | Contents                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Page Name**            | Calendar Page                                                                                          |
| **Route Path**           | `/calendar`                                                                                            |
| **Layout Type**          | Dashboard Layout (Header + Sidebar + Main Content)                                                     |
| **Description**          | Calendar page with Google Calendar API integration for viewing, creating, editing, and deleting events |
| **Author / Last Update** | AI Assistant / 2025-11-10                                                                              |

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

| Component       | Role                             | Related File                                          | Props / Interface       | Related Module    |
| --------------- | -------------------------------- | ----------------------------------------------------- | ----------------------- | ----------------- |
| CalendarPage    | Page root component              | `src/pages/calendar/ui/CalendarPage.tsx`              | -                       | useCalendarEvents |
| Header          | Global header (navigation, auth) | `src/widgets/header/ui/Header.tsx`                    | -                       | useUserStore      |
| CalendarSidebar | Collapsible side navigation      | `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` | isCollapsed, onToggle   | React Router      |
| CalendarView    | Calendar view container          | `src/widgets/calendar-view/ui/CalendarView.tsx`       | events: CalendarEvent[] | date-fns          |
| CalendarHeader  | Calendar title and controls      | `src/widgets/calendar-view/ui/CalendarHeader.tsx`     | currentDate, view, etc. | -                 |
| MonthView       | Monthly calendar grid            | `src/widgets/calendar-view/ui/MonthView.tsx`          | currentDate, events     | date-fns          |
| WeekView        | Weekly timeline view             | `src/widgets/calendar-view/ui/WeekView.tsx`           | currentDate, events     | date-fns          |
| DayView         | Daily timeline view              | `src/widgets/calendar-view/ui/DayView.tsx`            | currentDate, events     | date-fns          |

---

## 4. Feature Specification

| Feature                     | Description                                       | Trigger / Event        | State Management | API Integration          |
| --------------------------- | ------------------------------------------------- | ---------------------- | ---------------- | ------------------------ |
| Page Load                   | Render calendar after SessionGuard authentication | Route entry            | useUserStore     | GET /api/calendar/events |
| Fetch Events                | Load event data from Mock/real API                | useQuery (React Query) | Query cache      | GET /api/calendar/events |
| Switch View                 | Change between Day/Week/Month views               | Select onChange        | Local state      | None                     |
| Navigate Period             | Move date range (Day ±1, Week ±7, Month ±30)      | Button onClick         | Local state      | None                     |
| Keyboard Navigation         | Navigate with left/right arrow keys               | window keydown event   | Local state      | None                     |
| Toggle Sidebar              | Collapse/expand sidebar                           | Button onClick         | Local state      | None                     |
| Sidebar Navigation          | Navigate to Tasks/Ontology/Statistics pages       | Link onClick           | -                | None                     |
| Auth Persistence on Refresh | Restore user info from localStorage token         | SessionGuard useQuery  | useUserStore     | GET /api/users/me        |

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

| Category        | File Path                                                    | Description               |
| --------------- | ------------------------------------------------------------ | ------------------------- |
| Page Component  | `src/pages/calendar/ui/CalendarPage.tsx`                     | Calendar page root        |
| Page Index      | `src/pages/calendar/index.ts`                                | Page export               |
| Page Styles     | `src/pages/calendar/ui/CalendarPage.module.css`              | Page layout styles        |
| Sidebar Widget  | `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx`        | Sidebar component         |
| Sidebar Styles  | `src/widgets/calendar-sidebar/ui/CalendarSidebar.module.css` | Sidebar styles            |
| Calendar View   | `src/widgets/calendar-view/ui/CalendarView.tsx`              | View container            |
| Calendar Header | `src/widgets/calendar-view/ui/CalendarHeader.tsx`            | Header component          |
| Month View      | `src/widgets/calendar-view/ui/MonthView.tsx`                 | Monthly view              |
| Week View       | `src/widgets/calendar-view/ui/WeekView.tsx`                  | Weekly view               |
| Day View        | `src/widgets/calendar-view/ui/DayView.tsx`                   | Daily view                |
| Calendar Types  | `src/entities/calendar/model/calendar.types.ts`              | Calendar type definitions |
| Calendar Hook   | `src/features/calendar/model/useCalendarEvents.ts`           | React Query hook          |
| Calendar API    | `src/shared/apis/calendar.api.ts`                            | API functions             |
| Mock Data       | `src/shared/mocks/data/calendar.mock.ts`                     | Mock events/tasks data    |
| Mock Handlers   | `src/shared/mocks/handlers/calendar.handlers.ts`             | MSW handlers              |
| Session Guard   | `src/features/session/ui/SessionGuard.tsx`                   | Authentication guard      |
| Router Config   | `src/app/routes.tsx`                                         | Routing configuration     |

---

## 7. UX / UI Notes

### Design System

- **Color Scheme**: Dark theme (black background, blue accent)
- **Typography**:
  - Page Title: 2rem, bold
  - Date Range: 1.5rem, semi-bold
  - Event Text: 0.75-0.875rem
- **Layout**:
  - Header: Fixed, 65px height
  - Sidebar: 200px width (collapsed: 60px)
  - Main: Flexible, scrollable

### Interactions

- **View Switching**: Smooth transition with dropdown selector
- **Keyboard Navigation**:
  - `←` : Previous period
  - `→` : Next period
  - Disabled when input fields are focused
- **Sidebar Toggle**:
  - Top-right toggle button
  - Animated (0.3s transition)
- **Event Hover**:
  - Color emphasis
  - translateX(2-4px) effect

### Calendar Views

#### Month View

- 7x6 grid layout
- Display up to 3 events (+N more)
- Highlight today's date
- Adjust opacity for other month dates

#### Week View

- Hourly timeline (24 hours)
- Time labels on left (1 AM - 12 PM)
- Column per weekday
- Scrollable

#### Day View

- Single date timeline
- Detailed event display by hour
- Show full event descriptions

### Responsive Design

- **Desktop**: Optimized layout
- **Tablet (≤1024px)**: Fully functional
- **Mobile (≤768px)**: Sidebar hidden by default (TBD)

### Accessibility

- Full keyboard navigation support
- Clear focus indicators
- Semantic HTML structure
- Screen reader consideration (future)

---

## 8. Dependency & Integration

| Item             | Description                                   |
| ---------------- | --------------------------------------------- |
| Global Store     | `useUserStore()` - User authentication state  |
| State Management | React Query - Server state caching            |
| Date Library     | `date-fns` - Date calculation and formatting  |
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

| Item                            | Status     | Owner         | Notes                            |
| ------------------------------- | ---------- | ------------- | -------------------------------- |
| Drag & Drop event movement      | ⚪ Planned | Frontend Team | Utilize @dnd-kit library         |
| Event creation modal            | ⚪ Planned | Frontend Team | Show modal on date click         |
| Event edit/delete features      | ⚪ Planned | Frontend Team | Detail view/edit on event click  |
| Task integration display        | ⚪ Planned | Frontend Team | Display tasks alongside calendar |
| Google Calendar API integration | ⚪ Planned | Backend Team  | Replace Mock API with real API   |
| Recurring event support         | ⚪ Planned | Full Stack    | Handle recurring events          |
| Calendar sharing feature        | ⚪ Planned | Full Stack    | Team calendar sharing            |
| Mobile optimization             | ⚪ Planned | Frontend Team | Touch gestures, hamburger menu   |
| Offline mode                    | ⚪ Planned | Frontend Team | Service Worker caching           |
| Event search/filtering          | ⚪ Planned | Frontend Team | Search bar, category filters     |

---

## 10. Change Log

| Version | Date       | Changes                                                | Author       |
| ------- | ---------- | ------------------------------------------------------ | ------------ |
| v1.0    | 2025-11-10 | Initial creation - Month/Week/Day views implementation | AI Assistant |
| v1.0    | 2025-11-10 | Added sidebar navigation                               | AI Assistant |
| v1.0    | 2025-11-10 | Integrated Mock API with React Query                   | AI Assistant |
| v1.0    | 2025-11-10 | Implemented keyboard navigation (arrow keys)           | AI Assistant |
| v1.0    | 2025-11-10 | Enhanced SessionGuard auth flow (persist on refresh)   | AI Assistant |

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

- Landing Page: `docs/1. Mainpage/landing-page-en.md`
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
│ [◀]│ Calendar                              November 2025      │
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

- [ ] Verify events display correctly on page load
- [ ] Confirm Day/Week/Month view switching works properly
- [ ] Test prev/next buttons for date navigation
- [ ] Verify keyboard arrow key navigation works
- [ ] Confirm sidebar toggle button functions correctly
- [ ] Test sidebar menu links navigate to correct pages
- [ ] Verify login state persists after page refresh

### UI/UX

- [ ] Verify events render correctly in all views
- [ ] Confirm hover effects work smoothly
- [ ] Check loading states display clearly
- [ ] Ensure dark theme is consistently applied
- [ ] Verify today's date is clearly highlighted

### Performance

- [ ] Test rendering performance with large event datasets
- [ ] Verify no lag when switching views
- [ ] Confirm React Query caching works properly

### Accessibility

- [ ] Verify full navigation possible with keyboard only
- [ ] Check focus indicators are clear
- [ ] Confirm sufficient color contrast
