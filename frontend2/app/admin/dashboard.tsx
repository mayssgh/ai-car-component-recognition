import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Platform } from 'react-native'
import { useRouter } from 'expo-router'

interface Stats { total_scans: number; average_latency_ms: number; recent_logs: string[] }

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const fetchStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (e) { 
      console.error(e) 
    } finally { 
      setRefreshing(false) 
    }
  }

  useEffect(() => { fetchStats() }, [])

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor="#ecece4" />}>
      <View style={styles.header}>
        <Text style={styles.title}>Telemetry Matrix Console</Text>
        <Text style={styles.subtitle}>Real-Time Core Infrastructure Health</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.value}>{stats?.total_scans ?? 0}</Text>
          <Text style={styles.label}>Total AI Scans</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.value}>{stats?.average_latency_ms ?? 0} ms</Text>
          <Text style={styles.label}>Avg Latency Speed</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Inference Log Pipeline Feed</Text>
      <View style={styles.logConsole}>
        {stats?.recent_logs && stats.recent_logs.length > 0 ? (
          stats.recent_logs.map((log, idx) => (
            <View key={idx} style={styles.logRow}><Text style={styles.logText}>{log}</Text></View>
          ))
        ) : (
          <Text style={styles.emptyLogText}>No server events recorded yet.</Text>
        )}
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/tabs/scan')}>
        <Text style={styles.backButtonText}>Disconnect Terminal Session</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c19', paddingHorizontal: 20, paddingTop: 50 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#ecece4' },
  subtitle: { fontSize: 13, color: '#8c9293', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: '#20201d', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(236,236,228,0.06)' },
  value: { fontSize: 22, fontWeight: '700', color: '#e5e2dd' },
  label: { fontSize: 11, color: '#8c9293', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#ecece4', marginBottom: 12 },
  logConsole: { backgroundColor: '#0e0e0c', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(230, 232, 231, 0.1)', padding: 12, minHeight: 220 },
  logRow: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingVertical: 8 },
  logText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11, color: '#a3b899' },
  emptyLogText: { color: '#8c9293', fontSize: 12, textAlign: 'center', marginTop: 40 },
  backButton: { backgroundColor: '#2d4c4e', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  backButtonText: { color: '#ecece4', fontSize: 15, fontWeight: '600' }
})