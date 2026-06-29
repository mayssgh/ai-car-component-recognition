import React from 'react'
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function ResultScreen() {
  const router = useRouter()
  
  // Destructuring inference vectors from parameter pipeline
  const { partName, confidence, latency, imageUri } = useLocalSearchParams<{
    partName: string;
    confidence: string;
    latency: string;
    imageUri?: string;
  }>()

  // Format label strings gracefully (e.g., Brake_Component -> Brake Component)
  const formattedPartName = partName ? String(partName).replace(/_/g, ' ') : 'Unknown Component'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* ─── HEADER ────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Analysis Result</Text>
        <Text style={styles.subtitle}>AI Vision Model Classification Matrix</Text>
      </View>

      {/* ─── CAPTURED TARGET GRAPHIC ───────────────────────── */}
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.capturedImage} />
        </View>
      ) : null}

      {/* ─── DYNAMIC CLASSIFICATION DATA CARD ──────────────── */}
      <View style={styles.resultCard}>
        <Text style={styles.partLabel}>{formattedPartName}</Text>
        
        <View style={styles.badgeRow}>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{confidence || '0%'} Match</Text>
          </View>
          <Text style={styles.latencyText}>⚡ {latency || '0ms'}</Text>
        </View>
      </View>

      {/* ─── TECHNICAL ENGINE DATA CARD ─────────────────────── */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>⚙️ Component Dossier</Text>
        <Text style={styles.description}>
          Core operational assembly parsed via deep vision layers. Responsible for converting engine energy transitions to stabilize or drive system dynamics.
        </Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.metaLabel}>🕒 Recommended Inspection Interval:</Text>
        <Text style={styles.metaValue}>30,000 - 70,000 Miles Base Threshold</Text>
      </View>

      {/* ─── DIAGNOSTIC SYSTEM SYMPTOMS CARD ────────────────── */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>⚠️ Potential Fault Signals</Text>
        <View style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>Spongy or low baseline physical feedback loops</Text>
        </View>
        <View style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>High-pitched friction harmonic resonance or grinding whine</Text>
        </View>
        <View style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>System shuddering or vibrations under high-stress output load</Text>
        </View>
      </View>

      {/* ─── ACTION TRIGGER BAR ────────────────────────────── */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>➔ Scan Another Component</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1c1c19' 
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: 40,
    alignItems: 'center' 
  },
  header: { 
    marginBottom: 24, 
    width: '100%' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#ecece4', 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#8c9293', 
    marginTop: 6, 
    textAlign: 'center' 
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#20201d',
    borderWidth: 1,
    borderColor: 'rgba(236,236,228,0.06)',
    marginBottom: 16,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultCard: { 
    width: '100%',
    backgroundColor: '#20201d', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(236,236,228,0.06)', 
    marginBottom: 16, 
    alignItems: 'center' 
  },
  partLabel: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#ecece4', 
    textTransform: 'capitalize', 
    marginBottom: 12 
  },
  badgeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  confidenceBadge: { 
    backgroundColor: 'rgba(42,95,171,0.15)', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#2a5fab' 
  },
  confidenceText: { 
    color: '#6ca0f0', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  latencyText: { 
    color: '#8c9293', 
    fontSize: 13 
  },
  infoCard: { 
    width: '100%',
    backgroundColor: '#20201d', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(236,236,228,0.06)', 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#ecece4', 
    marginBottom: 10 
  },
  description: { 
    fontSize: 14, 
    color: '#8c9293', 
    lineHeight: 22 
  },
  divider: { 
    height: 1, 
    backgroundColor: 'rgba(236,236,228,0.06)', 
    marginVertical: 14 
  },
  metaLabel: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#8c9293' 
  },
  metaValue: { 
    fontSize: 14, 
    color: '#ecece4', 
    marginTop: 4,
    fontWeight: '500'
  },
  bulletRow: { 
    flexDirection: 'row', 
    marginTop: 8, 
    paddingRight: 12 
  },
  bullet: { 
    color: '#2a5fab', 
    fontSize: 14, 
    marginRight: 8, 
    fontWeight: '700' 
  },
  bulletText: { 
    color: '#8c9293', 
    fontSize: 14, 
    lineHeight: 20,
    flex: 1
  },
  backBtn: { 
    width: '100%',
    backgroundColor: '#2d4c4e', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(230,232,231,0.1)',
    marginTop: 8
  },
  backBtnText: { 
    color: '#ecece4', 
    fontSize: 16, 
    fontWeight: '600' 
  }
})