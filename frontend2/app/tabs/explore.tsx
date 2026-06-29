import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { useRouter } from 'expo-router'

// Static catalog data for offline browsing
const VEHICLE_SYSTEMS = [
  { id: '1', name: 'Engine Bay', icon: '🔧', count: 12 },
  { id: '2', name: 'Braking System', icon: '🛑', count: 6 },
  { id: '3', name: 'Electrical & Battery', icon: '⚡', count: 8 },
  { id: '4', name: 'Suspension & Steering', icon: '🛣️', count: 7 },
]

const EXPLORE_COMPONENTS = [
  {
    id: 'e1',
    category: 'Engine Bay',
    name: 'Alternator',
    description: 'Converts mechanical energy from the engine into electrical energy to charge your battery while running.',
    symptoms: 'Dim headlights, whining noises, dead battery after starting.',
  },
  {
    id: 'e2',
    category: 'Engine Bay',
    name: 'Mass Air Flow Sensor',
    description: 'Measures the amount of air entering the engine so the computer can calculate the correct fuel injection balance.',
    symptoms: 'Rough idling, engine stalling, poor fuel economy.',
  },
  {
    id: 'e3',
    category: 'Braking System',
    name: 'Brake Master Cylinder',
    description: 'Converts pressure on the brake pedal into hydraulic pressure that forces brake fluid down to the calipers.',
    symptoms: 'Spongy brake pedal, low fluid levels, car pulling to one side.',
  },
  {
    id: 'e4',
    category: 'Electrical & Battery',
    name: 'Car Battery',
    description: 'Provides the initial surge of electrical electricity needed to power the starter motor and engine computer.',
    symptoms: 'Slow engine crank, clicking noises when turning the key.',
  }
]

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Engine Bay')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Filter items by active tab selection AND search entry
  const displayComponents = EXPLORE_COMPONENTS.filter(item => {
    const matchesCategory = item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Systems</Text>
      <Text style={styles.subtitle}>Browse automotive components and view mechanical diagnostic profiles</Text>

      {/* Global Explorer Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search mechanical components..."
          placeholderTextColor="#8c9293"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {/* Categories Horizontal Carousel Selector */}
      <View style={{ maxHeight: 50, marginBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {VEHICLE_SYSTEMS.map((system) => {
            const isActive = system.name === selectedCategory
            return (
              <TouchableOpacity
                key={system.id}
                style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                onPress={() => setSelectedCategory(system.name)}
              >
                <Text style={styles.chipText}>{system.icon} {system.name}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Components Feed */}
      <FlatList
        data={displayComponents}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No documentation matches your selection.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.componentCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.componentName}>{item.name}</Text>
              <Text style={styles.categoryTag}>{item.category}</Text>
            </View>
            
            <Text style={styles.bodyDescription}>{item.description}</Text>
            
            <View style={styles.symptomBox}>
              <Text style={styles.symptomTitle}>⚠️ Common Failure Symptoms:</Text>
              <Text style={styles.symptomText}>{item.symptoms}</Text>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/result',
                params: { partName: item.name, confidence: '100% Manual Guide' }
              })}
            >
              <Text style={styles.actionButtonText}>View Structural Overview ➔</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122b2f', paddingHorizontal: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: '700', color: '#ecece4' },
  subtitle: { fontSize: 13, color: '#8c9293', marginTop: 4, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#1c1c19', borderRadius: 10, alignItems: 'center', paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(236,236,228,0.08)' },
  searchIcon: { marginRight: 8, fontSize: 14, color: '#8c9293' },
  searchInput: { flex: 1, height: 44, color: '#ecece4', fontSize: 14 },
  categoriesList: { paddingRight: 20, alignItems: 'center' },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(45,76,78,0.4)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(236,236,228,0.05)' },
  activeCategoryChip: { backgroundColor: '#2a5fab', borderColor: '#4a84d4' },
  chipText: { color: '#ecece4', fontSize: 13, fontWeight: '500' },
  componentCard: { backgroundColor: 'rgba(28,28,25,0.6)', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(236,236,228,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  componentName: { fontSize: 18, fontWeight: '700', color: '#ecece4' },
  categoryTag: { fontSize: 11, color: '#b1cbd0', backgroundColor: 'rgba(45,76,78,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  bodyDescription: { fontSize: 13, color: '#b1cbd0', lineHeight: 18, marginBottom: 12 },
  symptomBox: { backgroundColor: 'rgba(235, 94, 85, 0.08)', borderRadius: 8, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(235, 94, 85, 0.15)' },
  symptomTitle: { fontSize: 12, fontWeight: '700', color: '#eb5e55', marginBottom: 2 },
  symptomText: { fontSize: 12, color: '#ecece4', lineHeight: 16 },
  actionButton: { backgroundColor: 'rgba(42, 95, 171, 0.2)', height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a5fab' },
  actionButtonText: { color: '#aac7ff', fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#8c9293', fontSize: 14 }
})