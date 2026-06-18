import { create } from 'zustand'
import { authService } from '../services/auth.service'

interface AuthState {
  user: any | null
  isAuthenticated: boolean // Added tracking variable
  loading: boolean
  setUser: (user: any) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false, // Default state on system boot
  loading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: async (email, password) => {
    set({ loading: true })
    const { data, error } = await authService.login(email, password)
    if (error) {
      set({ loading: false })
      throw error
    }
    // Set both user and authenticated flags safely
    set({ user: data.user, isAuthenticated: true, loading: false })
  },
  logout: async () => {
    await authService.logout()
    set({ user: null, isAuthenticated: false })
  }
}))