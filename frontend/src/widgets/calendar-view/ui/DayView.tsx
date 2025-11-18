import type { CalendarEvent } from '@/entities/calendar'
import { format, isSameDay } from 'date-fns'
import styles from './DayView.module.css'

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

export function DayView({ currentDate, events }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      const eventHour = eventStart.getHours()
      return isSameDay(currentDate, eventStart) && eventHour === hour
    })
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  return (
    <div className={styles.dayView}>
      <div className={styles.dayHeader}>
        <div className={styles.dayName}>{format(currentDate, 'EEEE')}</div>
        <div className={styles.dayNumber}>{format(currentDate, 'MMMM d, yyyy')}</div>
      </div>

      <div className={styles.timeline}>
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour)
          return (
            <div key={hour} className={styles.hourBlock}>
              <div className={styles.timeLabel}>{formatHour(hour)}</div>
              <div className={styles.eventColumn}>
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={styles.event}
                    style={{ backgroundColor: event.color || '#3b82f6' }}
                  >
                    <div className={styles.eventTime}>
                      {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                    </div>
                    <div className={styles.eventTitle}>{event.title}</div>
                    {event.description && (
                      <div className={styles.eventDescription}>{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

