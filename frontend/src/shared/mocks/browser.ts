import { setupWorker } from 'msw/browser'
import { calendarHandlers } from './handlers/calendar.handlers'

export const worker = setupWorker(...calendarHandlers)

