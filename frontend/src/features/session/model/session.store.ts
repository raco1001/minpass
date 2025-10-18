import type { User } from '@/entities/users/model/user.types'
import { create } from 'zustand'


interface SessionState { user: User | null }
interface SessionActions { setUser: (u: User | null) => void }


export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}))