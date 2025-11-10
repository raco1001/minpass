import type { CalendarEvent } from '@/entities/calendar'
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import styles from './MonthView.module.css'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

export function MonthView({ currentDate, events }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = 'd'
  const rows: Date[][] = []

  let days: Date[] = []
  let day = startDate

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day)
      day = addDays(day, 1)
    }
    rows.push(days)
    days = []
  }

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return (
        isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) ||
        (day > eventStart && day < eventEnd)
      )
    })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={styles.monthView}>
      <div className={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {rows.map((week, weekIndex) => (
          <div key={weekIndex} className={styles.weekRow}>
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={dayIndex}
                  className={`${styles.dayCell} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''
                    }`}
                >
                  <div className={styles.dayNumber}>{format(day, dateFormat)}</div>
                  <div className={styles.eventsContainer}>
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={styles.event}
                        style={{ backgroundColor: event.color || '#3b82f6' }}
                        title={event.title}
                      >
                        <span className={styles.eventTitle}>{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className={styles.moreEvents}>+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

