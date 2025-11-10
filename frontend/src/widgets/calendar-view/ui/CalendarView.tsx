import type { CalendarEvent, CalendarView as ViewType } from '@/entities/calendar'
import { addDays, addMonths, addWeeks } from 'date-fns'
import { useEffect, useState } from 'react'
import { CalendarHeader } from './CalendarHeader'
import styles from './CalendarView.module.css'
import { DayView } from './DayView'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'

interface CalendarViewProps {
  events: CalendarEvent[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>('month')

  const handlePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate((date) => addDays(date, -1))
        break
      case 'week':
        setCurrentDate((date) => addWeeks(date, -1))
        break
      case 'month':
        setCurrentDate((date) => addMonths(date, -1))
        break
    }
  }

  const handleNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate((date) => addDays(date, 1))
        break
      case 'week':
        setCurrentDate((date) => addWeeks(date, 1))
        break
      case 'month':
        setCurrentDate((date) => addMonths(date, 1))
        break
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view])

  const renderCalendarView = () => {
    switch (view) {
      case 'day':
        return <DayView currentDate={currentDate} events={events} />
      case 'week':
        return <WeekView currentDate={currentDate} events={events} />
      case 'month':
        return <MonthView currentDate={currentDate} events={events} />
    }
  }

  return (
    <div className={styles.calendarView}>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      <div className={styles.calendarContent}>{renderCalendarView()}</div>
    </div>
  )
}

