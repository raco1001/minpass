import { create } from 'zustand'
import type { User } from './user.types'


type State = { user: User | Partial<User> | null }
interface Actions {
  setUser: (u: User | Partial<User> | null) => void
}


export const useUserStore = create<State & Actions>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}))