import type { CalendarEvent, Task } from '@/entities/calendar'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const { data } = await api.get<{ events: CalendarEvent[] }>('/calendar/events')
  return data.events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }))
}

export async function getCalendarTasks(): Promise<Task[]> {
  const { data } = await api.get<{ tasks: Task[] }>('/calendar/tasks')
  return data.tasks.map((task) => ({
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
  }))
}

export async function createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  const { data } = await api.post<{ event: CalendarEvent }>('/calendar/events', event)
  return {
    ...data.event,
    start: new Date(data.event.start),
    end: new Date(data.event.end),
  }
}

export async function updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const { data } = await api.put<{ event: CalendarEvent }>(`/calendar/events/${id}`, updates)
  return {
    ...data.event,
    start: new Date(data.event.start),
    end: new Date(data.event.end),
  }
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/calendar/events/${id}`)
}

