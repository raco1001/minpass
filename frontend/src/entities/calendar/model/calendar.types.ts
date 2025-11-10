export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  color?: string
  allDay?: boolean
}

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
}

export type CalendarView = 'day' | 'week' | 'month'

export interface CalendarState {
  currentDate: Date
  view: CalendarView
  events: CalendarEvent[]
  tasks: Task[]
}

