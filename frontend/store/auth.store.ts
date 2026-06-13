import { create } from 'zustand'
import { authService } from '../services/auth.service'

interface AuthState {
  user: any | null
  loading: boolean
  setUser: (user: any) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    set({ loading: true })
    const { data, error } = await authService.login(email, password)
    if (error) throw error
    set({ user: data.user, loading: false })
  },
  logout: async () => {
    await authService.logout()
    set({ user: null })
  }
}))