import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Animated, Alert, ActivityIndicator
} from 'react-native'
import { useState, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useScanStore } from '../store/scan.store'
import { useAuthStore } from '../store/auth.store'
import { historyService } from '../services/history.service'
import { formatConfidence, getConfidenceColor } from '../utils/formatters'
import { Colors } from '../constants/colors'
import api from '../services/api'

// --- Accordion Component ---
interface AccordionProps {
  icon: string
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Accordion({ icon, title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const animation = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current

  const toggle = () => {
    const toValue = open ? 0 : 1
    Animated.timing(animation, {
      toValue,
      duration: 280,
      useNativeDriver: false,
    }).start()
    setOpen(!open)
  }

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  })

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  return (
    <TouchableOpacity
      style={styles.accordion}
      onPress={toggle}
      activeOpacity={0.85}
    >
      <View style={styles.accordionHeader}>
        <View style={styles.accordionLeft}>
          <Text style={styles.accordionIcon}>{icon}</Text>
          <Text style={styles.accordionTitle}>{title}</Text>
        </View>
        <Animated.Text
          style={[styles.chevron, { transform: [{ rotate: rotation }] }]}
        >
          ▾
        </Animated.Text>
      </View>
      <Animated.View style={{ maxHeight, overflow: 'hidden' }}>
        <View style={styles.accordionBody}>{children}</View>
      </Animated.View>
    </TouchableOpacity>
  )
}

// --- Main Result Screen ---
export default function ResultScreen() {
  const { result, clearResult } = useScanStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const [reporting, setReporting] = useState(false)

  // Fallback mock data for development
  const scanResult = result?.results?.[0] ?? {
    component_name: 'Alternator',
    confidence: 0.962,
    info: {
      description: 'The alternator is an electrical generator that converts mechanical energy to electrical energy. In modern vehicles, it charges the battery and powers the electrical system when the engine is running.',
      function: 'Maintains battery charge and powers all onboard electrical systems including ignition, lights, and computers.',
      location: 'Bolted to the engine block, driven by the serpentine belt. Look for a cylindrical metal housing with cooling vents near the front of the engine bay.',
      troubleshooting: 'Dimming headlights or battery warning light on dashboard. Listen for whining or grinding noises while engine is running.',
    }
  }

  const confidence = scanResult.confidence
  const confidenceColor = getConfidenceColor(confidence)
  const confidenceLabel = formatConfidence(confidence)
  const info = scanResult.info ?? {}

  const handleReport = async () => {
    if (!result?.scan_id) {
      Alert.alert('Error', 'No scan found to report.')
      return
    }
    try {
      setReporting(true)
      await api.post('/feedback/', {
        scan_id: result.scan_id,
        note: 'User reported incorrect result',
      })
      Alert.alert('Thanks!', 'Your feedback has been submitted.')
    } catch {
      Alert.alert('Error', 'Failed to submit feedback. Try again.')
    } finally {
      setReporting(false)
    }
  }

  const handleBack = () => {
    clearResult()
    router.back()
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
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
      >
        {/* Hero Image */}
        <View style={styles.heroCard}>
          {result?.image_url ? (
            <Image
              source={{ uri: result.image_url }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderText}>🔧</Text>
            </View>
          )}

          {/* Confidence Badge */}
          <View style={[styles.confidenceBadge, { borderColor: confidenceColor }]}>
            <Text style={styles.confidenceLabel}>CONFIDENCE</Text>
            <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
              {confidenceLabel}
            </Text>
          </View>

          {/* Component Name Overlay */}
          <View style={styles.heroOverlay}>
            <Text style={styles.componentName}>{scanResult.component_name}</Text>
            <View style={styles.tagRow}>
              <View style={styles.tagGreen}>
                <Text style={styles.tagText}>CHARGING SYSTEM</Text>
              </View>
              <View style={styles.tagBlue}>
                <Text style={styles.tagText}>VITAL COMPONENT</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Accordion Sections */}
        <View style={styles.sections}>

          {/* Description */}
          <Accordion icon="ℹ️" title="Description" defaultOpen>
            <Text style={styles.bodyText}>
              {info.description ?? 'No description available.'}
            </Text>
          </Accordion>

          {/* Vehicle Function */}
          <Accordion icon="⚡" title="Vehicle Function">
            {info.function ? (
              info.function.split('.').filter(Boolean).map((point: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>✓</Text>
                  <Text style={styles.bulletText}>{point.trim()}.</Text>
                </View>
              ))
            ) : (
              <Text style={styles.bodyText}>No function info available.</Text>
            )}
          </Accordion>

          {/* Location */}
          <Accordion icon="📍" title="Location">
            <Text style={styles.bodyText}>
              {info.location ?? 'No location info available.'}
            </Text>
          </Accordion>

          {/* Troubleshooting */}
          <Accordion icon="🔧" title="Troubleshooting Tips">
            {info.troubleshooting ? (
              <>
                <View style={styles.troubleCard}>
                  <View style={[styles.troubleBorder, { borderColor: Colors.danger }]} />
                  <View style={styles.troubleContent}>
                    <Text style={[styles.troubleLabel, { color: Colors.danger }]}>
                      RED FLAG
                    </Text>
                    <Text style={styles.troubleText}>
                      {info.troubleshooting.split('.')[0]?.trim()}.
                    </Text>
                  </View>
                </View>
                {info.troubleshooting.split('.')[1] && (
                  <View style={[styles.troubleCard, { marginTop: 8 }]}>
                    <View style={[styles.troubleBorder, { borderColor: '#a6d1b3' }]} />
                    <View style={styles.troubleContent}>
                      <Text style={[styles.troubleLabel, { color: '#a6d1b3' }]}>
                        CHECK ITEM
                      </Text>
                      <Text style={styles.troubleText}>
                        {info.troubleshooting.split('.')[1]?.trim()}.
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.bodyText}>No troubleshooting info available.</Text>
            )}
          </Accordion>

        </View>

        {/* Report Button */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReport}
          disabled={reporting}
          activeOpacity={0.8}
        >
          {reporting ? (
            <ActivityIndicator color="#c2c7c9" size="small" />
          ) : (
            <>
              <Text style={styles.reportIcon}>⚑</Text>
              <Text style={styles.reportText}>Report wrong result</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(45,76,78,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#b1cbd0',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: { fontSize: 18 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b1cbd0',
    letterSpacing: -0.3,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#004792',
    borderWidth: 1,
    borderColor: 'rgba(139,185,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aac7ff',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  // Hero
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(45,76,78,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(236,236,228,0.1)',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  heroPlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#0e1a1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    fontSize: 64,
  },
  confidenceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,71,146,0.9)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  confidenceLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    color: '#fff',
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroOverlay: {
    padding: 16,
    paddingTop: 12,
  },
  componentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e5e2dd',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagGreen: {
    backgroundColor: '#042e1a',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagBlue: {
    backgroundColor: '#122b2f',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#6f987c',
  },

  // Sections
  sections: {
    gap: 12,
    marginBottom: 16,
  },

  // Accordion
  accordion: {
    backgroundColor: 'rgba(45,76,78,0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236,236,228,0.1)',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accordionIcon: {
    fontSize: 18,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e2dd',
  },
  chevron: {
    fontSize: 18,
    color: '#8c9293',
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Body text
  bodyText: {
    fontSize: 14,
    color: '#c2c7c9',
    lineHeight: 22,
  },

  // Bullet list
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: '#aac7ff',
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#c2c7c9',
    lineHeight: 22,
  },

  // Troubleshooting cards
  troubleCard: {
    flexDirection: 'row',
    backgroundColor: '#1c1c19',
    borderRadius: 10,
    overflow: 'hidden',
  },
  troubleBorder: {
    width: 4,
    borderLeftWidth: 4,
  },
  troubleContent: {
    flex: 1,
    padding: 12,
  },
  troubleLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  troubleText: {
    fontSize: 14,
    color: '#e5e2dd',
    lineHeight: 20,
  },

  // Report button
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(140,146,147,0.3)',
    backgroundColor: 'transparent',
  },
  reportIcon: {
    fontSize: 16,
    color: '#c2c7c9',
  },
  reportText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#c2c7c9',
  },
})