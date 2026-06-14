import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { useRouter, useSegments } from 'expo-router'
import { useAuth } from '../hooks/useAuth'

export default function RootLayout() {
  const { isAuthenticated } = useAuth()
  const segments = useSegments()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const inAuthGroup = segments[0] === 'auth'
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/tabs/scan')
    }
  }, [isAuthenticated, mounted])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="tabs" />
      <Stack.Screen name="result" />
    </Stack>
  )
}
