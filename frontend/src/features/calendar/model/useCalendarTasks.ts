import type { Task } from '@/entities/calendar'
import { getCalendarTasks } from '@/shared/apis/calendar.api'
import { useQuery } from '@tanstack/react-query'

export function useCalendarTasks() {
  return useQuery<Task[], Error>({
    queryKey: ['calendar', 'tasks'],
    queryFn: getCalendarTasks,
  })
}

