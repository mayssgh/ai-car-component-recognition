import { supabase } from '../supabase/client'

export const authService = {
  register: async (email: string, password: string, fullName: string) => {
    return supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
  },
  login: async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  },
  logout: async () => {
    return supabase.auth.signOut()
  },
  resetPassword: async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email)
  },
  getSession: async () => {
    return supabase.auth.getSession()
  }
}