import type { CalendarEvent } from '@/entities/calendar'
import { getCalendarEvents } from '@/shared/apis/calendar.api'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

export function useCalendarEvents(): UseQueryResult<CalendarEvent[], Error> {
  return useQuery<CalendarEvent[], Error>({
    queryKey: ['calendar', 'events'],
    queryFn: getCalendarEvents,
  })
}

