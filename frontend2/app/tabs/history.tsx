import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, RefreshControl
} from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useHistory } from '../../hooks/useHistory'
import { useAuthStore } from '../../store/auth.store'
import { useScanStore } from '../../store/scan.store'
import { formatDate, formatConfidence, getConfidenceColor } from '../../utils/formatters'
import { Scan, ScanResult } from '../../types/scan.types'
import { Colors } from '../../constants/colors'

// --- History Item Component ---
interface HistoryItemProps {
  scan: Scan
  onPress: () => void
}

function HistoryItem({ scan, onPress }: HistoryItemProps) {
  const topResult: ScanResult = scan.results?.[0]
  if (!topResult) return null

  const confidence = topResult.confidence
  const confidenceColor = getConfidenceColor(confidence)

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        {scan.image_url ? (
          <Image
            source={{ uri: scan.image_url }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>🔧</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.itemInfo}>
        <View style={styles.itemTopRow}>
          <Text style={styles.itemName} numberOfLines={1}>
            {topResult.component_name}
          </Text>
          <View style={[styles.confidencePill, { borderColor: confidenceColor }]}>
            <Text style={[styles.confidencePillText, { color: confidenceColor }]}>
              {formatConfidence(confidence)}
            </Text>
          </View>
        </View>
        <View style={styles.itemDateRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.itemDate}>
            {formatDate(scan.created_at).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )
}

// --- Empty State Component ---
function EmptyState({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No scans yet.</Text>
      <Text style={styles.emptySubtitle}>
        Start by scanning a car part to see it here.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onPress}>
        <Text style={styles.emptyButtonText}>Launch Scanner</Text>
      </TouchableOpacity>
    </View>
  )
}

// --- Main History Screen ---
export default function HistoryScreen() {
  const { history, loading, error } = useHistory()
  const { user } = useAuthStore()
  const { result: currentResult } = useScanStore()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const totalScans = history.length
  const avgAccuracy = history.length > 0
    ? history.reduce((acc, scan) => {
        const top = scan.results?.[0]
        return acc + (top?.confidence ?? 0)
      }, 0) / history.length
    : 0

  const handleItemPress = (scan: Scan) => {
    // Navigate to result with existing scan data
    router.push('/result')
  }

  const onRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Text style={styles.headerIcon}>📷</Text>
          <Text style={styles.headerTitle}>BakoVision</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#b1cbd0"
          />
        }
      >
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Diagnostic History</Text>
          <Text style={styles.pageSubtitle}>
            Review your past vehicle part identifications.
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL SCANS</Text>
            <Text style={styles.statValue}>{totalScans}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: '#aac7ff' }]}>ACCURACY</Text>
            <Text style={styles.statValue}>
              {avgAccuracy > 0 ? formatConfidence(avgAccuracy) : '—'}
            </Text>
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#b1cbd0" size="large" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <EmptyState onPress={() => router.push('/tabs/scan')} />
        )}

        {/* History List */}
        {!loading && !error && history.length > 0 && (
          <View style={styles.list}>
            {history.map((scan) => (
              <HistoryItem
                key={scan.scan_id}
                scan={scan}
                onPress={() => handleItemPress(scan)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/tabs/scan')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>📷</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122b2f',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#20201d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(66,72,73,0.2)',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: { fontSize: 20 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#b1cbd0',
    letterSpacing: -0.3,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2d4c4e',
    borderWidth: 1,
    borderColor: 'rgba(177,203,208,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b1cbd0',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  // Page header
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e5e2dd',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#c2c7c9',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2d4c4e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    gap: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#a6d1b3',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e5e2dd',
    letterSpacing: -0.5,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#c2c7c9',
  },

  // Error
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  errorIcon: { fontSize: 32 },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    textAlign: 'center',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e2dd',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#c2c7c9',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#b1cbd0',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c3438',
  },

  // List
  list: {
    gap: 10,
  },

  // Item
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d4c4e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    gap: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0e0e0c',
    flexShrink: 0,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e2dd',
    flex: 1,
  },
  confidencePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  confidencePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  itemDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarIcon: {
    fontSize: 12,
  },
  itemDate: {
    fontSize: 11,
    color: '#8c9293',
    letterSpacing: 0.8,
  },
  chevron: {
    fontSize: 22,
    color: '#8c9293',
    flexShrink: 0,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 88,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#004792',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2a5fab',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
  },
})