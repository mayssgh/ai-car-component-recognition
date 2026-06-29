import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Platform } from 'react-native'
import { FontAwesome } from '@expo/vector-icons';
// 🌟 SMART LOOKUP MATRIX: Prevents duplicate anonymous function evaluations on every frame render
const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.mappings; inactive: keyof typeof Ionicons.mappings }> = {
  scan: { active: 'scan', inactive: 'scan-outline' },
  explore: { active: 'compass', inactive: 'compass-outline' },
  history: { active: 'time', inactive: 'time-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
}

// Global configuration helper to render icons efficiently
const renderTabBarIcon = (routeName: string) => {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
    const iconConfig = TAB_ICONS[routeName]
    if (!iconConfig) return null
    const iconName = focused ? iconConfig.active : iconConfig.inactive
    return <Ionicons name={iconName} size={size} color={color} />
  }
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2a5fab', // Premium Bako Blue Accent
        tabBarInactiveTintColor: '#8c9293', // Muted Matte Grey
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2, // Pulls text slightly closer to icon for tighter balance
        },
        tabBarStyle: {
          backgroundColor: '#1c1c19',
          borderTopColor: 'rgba(236,236,228,0.08)',
          borderTopWidth: 1,
          ...Platform.select({
            ios: {
              height: 88, // Safe zone scaling to accommodate native gesture sliders
              paddingBottom: 28,
            },
            android: {
              height: 68,
              paddingBottom: 12,
            },
            web: {
              height: 64,
              paddingBottom: 10,
            }
          }),
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scanner',
          tabBarIcon: renderTabBarIcon('scan'),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: renderTabBarIcon('explore'),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
      <FontAwesome name="bar-chart" size={size ?? 22} color={color} />
    ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: renderTabBarIcon('profile'),
        }}
      />
    </Tabs>
  )
}