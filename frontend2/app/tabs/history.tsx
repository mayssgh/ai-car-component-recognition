import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import api from '../../services/api'

interface ScanHistoryItem {
  id: string
  component_name: string
  confidence: string
  created_at: string
  image_url?: string
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([])
  const [orderedHistory, setOrderedHistory] = useState<ScanHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuthStore()

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/history/')
      
      // Sort initially by newest timestamp first
      const sortedByDate = response.data.sort((a: ScanHistoryItem, b: ScanHistoryItem) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      setHistory(sortedByDate)
      arrangeData(searchQuery, sortedByDate)
    } catch (error: any) {
      console.error("Failed to load scan history:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // Smart Arrangement logic: Matched search queries bubble to index [0]
  const arrangeData = (query: string, fullList: ScanHistoryItem[]) => {
    const trimmedQuery = query.trim().toLowerCase()
    
    if (!trimmedQuery) {
      setOrderedHistory(fullList)
      return
    }

    // Split items into exact match/part matches vs regular history
    const matchedItems: ScanHistoryItem[] = []
    const remainingItems: ScanHistoryItem[] = []

    fullList.forEach(item => {
      if (item.component_name?.toLowerCase().includes(trimmedQuery)) {
        matchedItems.push(item)
      } else {
        remainingItems.push(item)
      }
    })

    // Combine them back: your matches go first, everything else flows under it
    setOrderedHistory([...matchedItems, ...remainingItems])
  }

  const handleSearchChange = (text: string) => {
    setSearchQuery(text)
    arrangeData(text, history)
  }

  const handleSelectPastScan = (item: ScanHistoryItem) => {
    router.push({
      pathname: '/result',
      params: {
        partName: item.component_name,
        confidence: item.confidence,
        imageUri: item.image_url
      }
    })
  }

  if (loading && history.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2a5fab" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan History</Text>
      <Text style={styles.subtitle}>Review your previously identified automotive components</Text>

      {/* Search Input Field */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search component profiles..."
          placeholderTextColor="#8c9293"
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Label indicating order state */}
      <Text style={styles.sectionLabel}>
        {searchQuery ? '🎯 Top Search Results First' : '⏱️ Latest Scans'}
      </Text>

      <FlatList
        data={orderedHistory}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={fetchHistory}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No components scanned yet.</Text>
        }
        renderItem={({ item, index }) => {
          // Highlight the top match if a query is active
          const isTopMatch = searchQuery.length > 0 && item.component_name?.toLowerCase().includes(searchQuery.toLowerCase()) && index === 0;

          return (
            <TouchableOpacity 
              style={[styles.card, isTopMatch && styles.topMatchCard]} 
              onPress={() => handleSelectPastScan(item)}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.cardImage} />
              ) : (
                <View style={styles.placeholderCardIcon}><Text style={{fontSize: 20}}>🔧</Text></View>
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.partName}>
                  {item.component_name ? item.component_name.replace(/_/g, ' ') : 'Unknown Part'}
                </Text>
                <Text style={styles.metaText}>Confidence: {item.confidence || '0.00%'}</Text>
                <Text style={styles.dateText}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              <Text style={styles.arrow}>{isTopMatch ? '⭐' : '➔'}</Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122b2f', paddingHorizontal: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: '700', color: '#ecece4' },
  subtitle: { fontSize: 13, color: '#8c9293', marginTop: 4, marginBottom: 16 },
  centered: { flex: 1, backgroundColor: '#122b2f', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#1c1c19', borderRadius: 10, alignItems: 'center', paddingHorizontal: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(236,236,228,0.08)' },
  searchIcon: { marginRight: 8, fontSize: 14, color: '#8c9293' },
  searchInput: { flex: 1, height: 44, color: '#ecece4', fontSize: 14 },
  clearIcon: { marginLeft: 8, fontSize: 14, color: '#8c9293', padding: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#8c9293', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingLeft: 2 },
  emptyText: { color: '#8c9293', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: 'rgba(45,76,78,0.4)', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(236,236,228,0.05)' },
  topMatchCard: { backgroundColor: 'rgba(42, 95, 171, 0.4)', borderColor: '#2a5fab', borderWidth: 1.5 },
  cardImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  placeholderCardIcon: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#20201d', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  partName: { fontSize: 16, fontWeight: '600', color: '#ecece4' },
  metaText: { fontSize: 12, color: '#aac7ff', marginTop: 2 },
  dateText: { fontSize: 11, color: '#8c9293', marginTop: 4 },
  arrow: { color: '#b1cbd0', fontSize: 16, paddingHorizontal: 4 }
})