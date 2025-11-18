import type { CalendarEvent } from '@/entities/calendar'
import { addDays, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns'
import styles from './WeekView.module.css'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

export function WeekView({ currentDate, events }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const days: Date[] = []
  let day = weekStart

  while (day <= weekEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      const eventHour = eventStart.getHours()
      return isSameDay(day, eventStart) && eventHour === hour
    })
  }

  return (
    <div className={styles.weekView}>
      <div className={styles.header}>
        <div className={styles.timeColumn}></div>
        {days.map((day, index) => (
          <div
            key={index}
            className={`${styles.dayHeader} ${isSameDay(day, new Date()) ? styles.today : ''}`}
          >
            <div className={styles.dayName}>{format(day, 'EEE')}</div>
            <div className={styles.dayNumber}>{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      <div className={styles.body}>
        {hours.map((hour) => (
          <div key={hour} className={styles.hourRow}>
            <div className={styles.timeLabel}>
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            {days.map((day, dayIndex) => {
              const hourEvents = getEventsForDayAndHour(day, hour)
              return (
                <div key={dayIndex} className={styles.hourCell}>
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={styles.event}
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                      title={`${event.title} - ${format(event.start, 'h:mm a')}`}
                    >
                      <div className={styles.eventTime}>{format(event.start, 'h:mm a')}</div>
                      <div className={styles.eventTitle}>{event.title}</div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

