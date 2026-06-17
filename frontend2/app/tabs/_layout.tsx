import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tab, focused && styles.tabActive]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.bar, tabBarShowLabel: false }}>
      <Tabs.Screen name="scan" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="??" label="Scan" focused={focused} /> }} />
      <Tabs.Screen name="explore" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="??" label="Explore" focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="??" label="History" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="??" label="Profile" focused={focused} /> }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#1c1c19',
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  tab: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, gap: 2 },
  tabActive: { backgroundColor: '#004792' },
  icon: { fontSize: 18 },
  label: { fontSize: 9, fontWeight: '500', color: '#8c9293', letterSpacing: 0.5 },
  labelActive: { color: '#aac7ff', fontWeight: '700' },
})
