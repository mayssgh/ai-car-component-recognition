import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '../store/auth.store'

export default function RootLayout() {
  const { isAuthenticated, loading } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Wait for the navigation system to safely mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return

    const rootSegment = segments[0]
    const inAuthGroup = rootSegment === 'auth'
    const inAdminGroup = rootSegment === 'admin'

    // Case 1: User is NOT authenticated, but trying to access core app screens
    if (!isAuthenticated && !inAuthGroup && !inAdminGroup) {
      router.replace('/auth/login')
    } 
    // Case 2: User IS authenticated, but lingering around user auth login screens
    else if (isAuthenticated && inAuthGroup) {
      router.replace('/tabs/scan')
    }
  }, [isAuthenticated, loading, mounted, segments])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="tabs" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="result" />
    </Stack>
  )
}