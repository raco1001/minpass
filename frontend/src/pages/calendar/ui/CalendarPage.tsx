import { useCalendarEvents } from '@/features/calendar/model/useCalendarEvents'
import { Header } from '@/widgets/header'
import { CalendarSidebar } from '@/widgets/calendar-sidebar'
import { CalendarView } from '@/widgets/calendar-view'
import { useState } from 'react'
import styles from './CalendarPage.module.css'

export function CalendarPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { data: events = [], isLoading } = useCalendarEvents()

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.content}>
        <CalendarSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={styles.main}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading calendar...</p>
            </div>
          ) : (
            <CalendarView events={events} />
          )}
        </main>
      </div>
    </div>
  )
}

