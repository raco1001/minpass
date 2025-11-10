import type { CalendarView } from '@/entities/calendar'
import { format } from 'date-fns'
import styles from './CalendarHeader.module.css'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onPrevious: () => void
  onNext: () => void
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
}: CalendarHeaderProps) {
  const getDateRangeText = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy')
      case 'week':
        return format(currentDate, 'MMMM yyyy')
      case 'month':
        return format(currentDate, 'MMMM yyyy')
    }
  }

  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Calendar</h1>
        <p className={styles.subtitle}>
          Direct CRUD operations on your <strong>Google Calendar</strong> via API. No data
          stored in MinPass database.
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.dateRange}>{getDateRangeText()}</div>

        <div className={styles.rightControls}>
          <div className={styles.navigation}>
            <button className={styles.navButton} onClick={onPrevious} title="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className={styles.navButton} onClick={onNext} title="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <select
            className={styles.viewSelector}
            value={view}
            onChange={(e) => onViewChange(e.target.value as CalendarView)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      <div className={styles.hint}>
        Use <kbd>←</kbd> <kbd>→</kbd> arrow keys to navigate
      </div>
    </div>
  )
}

