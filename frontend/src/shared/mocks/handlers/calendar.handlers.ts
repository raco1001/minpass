import { http, HttpResponse } from 'msw'
import { mockEvents, mockTasks } from '../data/calendar.mock'

export const calendarHandlers = [
  http.get('/api/calendar/events', () => {
    return HttpResponse.json({ events: mockEvents })
  }),

  http.get('/api/calendar/tasks', () => {
    return HttpResponse.json({ tasks: mockTasks })
  }),

  http.post('/api/calendar/events', async ({ request }) => {
    const newEvent = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ event: { ...newEvent, id: Date.now().toString() } })
  }),

  http.put('/api/calendar/events/:id', async ({ request, params }) => {
    const updates = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ event: { ...updates, id: params.id } })
  }),

  http.delete('/api/calendar/events/:id', ({ params }) => {
    return HttpResponse.json({ success: true, id: params.id })
  }),

  // Mock /users/me endpoint for authentication
  http.get('/api/users/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    // localStorage에서 저장된 userId 가져오기 (브라우저 환경이므로 직접 접근)
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId')
      
      if (token && userId) {
        return HttpResponse.json({
          user: {
            id: userId,
            email: `user_${userId}@example.com`,
            name: 'Mock User',
            isNewUser: false,
          },
        })
      }
    }

    return new HttpResponse(null, { status: 401 })
  }),
]

