import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useHistory } from '../../hooks/useHistory'
import { formatConfidence } from '../../utils/formatters'
import { Colors } from '../../constants/colors'

// --- Setting Row Component ---
interface SettingRowProps {
  icon: string
  label: string
  subtitle?: string
  onPress?: () => void
  danger?: boolean
}

function SettingRow({ icon, label, subtitle, onPress, danger }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Text style={styles.settingIconEmoji}>{icon}</Text>
        </View>
        <View style={styles.settingTextGroup}>
          <Text style={[styles.settingLabel, danger && { color: Colors.danger }]}>
            {label}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Text style={[styles.settingChevron, danger && { color: Colors.danger }]}>
        ›
      </Text>
    </TouchableOpacity>
  )
}

// --- Main Profile Screen ---
export default function ProfileScreen() {
  const { user, logout } = useAuthStore()
  const { history } = useHistory()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const totalScans = history.length
  const avgAccuracy = history.length > 0
    ? history.reduce((acc, scan) => {
        const top = scan.results?.[0]
        return acc + (top?.confidence ?? 0)
      }, 0) / history.length
    : 0

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split('@')[0]
    ?? 'User'

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true)
              await logout()
              router.replace('/auth/login')
            } catch {
              Alert.alert('Error', 'Failed to logout. Try again.')
            } finally {
              setLoggingOut(false)
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Text style={styles.headerIcon}>📷</Text>
          <Text style={styles.headerTitle}>BakoVision</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{initials}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Blobs */}
        <View style={styles.blobTopRight} />
        <View style={styles.blobBottomLeft} />

        {/* Profile Hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.displayEmail}>{user?.email ?? ''}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL SCANS</Text>
            <Text style={[styles.statValue, { color: '#b1cbd0' }]}>
              {totalScans}
            </Text>
            <View style={styles.statTrend}>
              <Text style={styles.statTrendIcon}>↑</Text>
              <Text style={styles.statTrendText}>+12% this week</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>AVG ACCURACY</Text>
            <Text style={[styles.statValue, { color: '#aac7ff' }]}>
              {avgAccuracy > 0 ? formatConfidence(avgAccuracy) : '—'}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.round(avgAccuracy * 100)}%` as any }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="👤"
              label="Account"
              onPress={() => Alert.alert('Coming soon', 'Account settings coming soon.')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="🔔"
              label="Notifications"
              subtitle="Alerts, updates, and reports"
              onPress={() => Alert.alert('Coming soon', 'Notification settings coming soon.')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="📋"
              label="Terms of Service"
              onPress={() => Alert.alert('Coming soon', 'Terms of service coming soon.')}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.8}
          >
            {loggingOut ? (
              <ActivityIndicator color={Colors.danger} size="small" />
            ) : (
              <>
                <Text style={styles.logoutIcon}>⎋</Text>
                <Text style={styles.logoutText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.versionText}>BakoVision v1.0.0 (Stable)</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2d4c4e',
    borderWidth: 1,
    borderColor: 'rgba(140,146,147,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b1cbd0',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },

  // Background blobs
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(177,203,208,0.04)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(170,199,255,0.04)',
  },

  // Profile Hero
  profileHero: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 3,
    backgroundColor: '#2d4c4e',
    borderWidth: 2,
    borderColor: '#aac7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
    shadowColor: '#2a5fab',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#122b2f',
    borderWidth: 3,
    borderColor: '#122b2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#b1cbd0',
    letterSpacing: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#aac7ff',
    borderWidth: 2,
    borderColor: '#122b2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002f65',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e5e2dd',
    letterSpacing: -0.3,
  },
  displayEmail: {
    fontSize: 13,
    color: '#c2c7c9',
    letterSpacing: 0.3,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(236,236,228,0.08)',
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#6f987c',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statTrendIcon: {
    fontSize: 12,
    color: '#a6d1b3',
  },
  statTrendText: {
    fontSize: 10,
    color: '#a6d1b3',
    letterSpacing: 0.3,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0e0e0c',
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#aac7ff',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#8c9293',
    marginBottom: 10,
    marginLeft: 4,
  },

  // Settings Card
  settingsCard: {
    backgroundColor: '#2d4c4e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236,236,228,0.08)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#20201d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconEmoji: {
    fontSize: 18,
  },
  settingTextGroup: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e5e2dd',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#8c9293',
  },
  settingChevron: {
    fontSize: 22,
    color: '#8c9293',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(66,72,73,0.15)',
    marginHorizontal: 16,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.3)',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  logoutIcon: {
    fontSize: 18,
    color: Colors.danger,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.danger,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(194,199,201,0.35)',
    letterSpacing: 0.5,
  },
})