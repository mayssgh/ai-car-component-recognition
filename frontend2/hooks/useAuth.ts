import { useEffect } from 'react'
import { useAuthStore } from '../store/auth.store'
import { supabase } from '../supabase/client'

export const useAuth = () => {
  const { user, setUser, login, logout } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return { user, login, logout, isAuthenticated: !!user }
}