import type { CalendarEvent, Task } from '@/entities/calendar'

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(2025, 10, 6, 10, 0),
    end: new Date(2025, 10, 6, 11, 0),
    description: 'Weekly team sync-up',
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'Project Review',
    start: new Date(2025, 10, 7, 14, 0),
    end: new Date(2025, 10, 7, 15, 30),
    description: 'Q4 project milestone review',
    color: '#8b5cf6',
  },
  {
    id: '3',
    title: 'Lunch with Client',
    start: new Date(2025, 10, 8, 12, 0),
    end: new Date(2025, 10, 8, 13, 30),
    description: 'Business lunch downtown',
    color: '#10b981',
  },
  {
    id: '4',
    title: 'Code Review',
    start: new Date(2025, 10, 6, 15, 0),
    end: new Date(2025, 10, 6, 16, 0),
    description: 'Review pending PRs',
    color: '#f59e0b',
  },
  {
    id: '5',
    title: 'Workshop',
    start: new Date(2025, 10, 10, 9, 0),
    end: new Date(2025, 10, 10, 17, 0),
    description: 'React Advanced Patterns',
    color: '#ef4444',
  },
]

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Complete feature implementation',
    completed: false,
    dueDate: new Date(2025, 10, 8),
    priority: 'high',
  },
  {
    id: 't2',
    title: 'Write documentation',
    completed: false,
    dueDate: new Date(2025, 10, 10),
    priority: 'medium',
  },
  {
    id: 't3',
    title: 'Update dependencies',
    completed: true,
    dueDate: new Date(2025, 10, 5),
    priority: 'low',
  },
]

