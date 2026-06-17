import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { componentService } from '../../services/component.service'

const ICONS: Record<string, string> = {
  'Alternator': '?', 'Brake Caliper': '??', 'Radiator': '???',
  'Turbocharger': '??', 'Fuel Injector': '?', 'Serpentine Belt': '??',
  'Shock Absorber': '??', 'Catalytic Converter': '??', 'Water Pump': '??',
  'Timing Belt': '??', 'Cooling_Fan': '??', 'Motor_Controller': '???', 'Brake_Component': '??',
}

export default function ExploreScreen() {
  const [components, setComponents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    componentService.getAll()
      .then(data => { setComponents(data); setFiltered(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!search) setFiltered(components)
    else setFiltered(components.filter(c => c.name.toLowerCase().includes(search.toLowerCase())))
  }, [search, components])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>?? Explore</Text>
        <Text style={styles.subtitle}>Browse all car components</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search components..."
          placeholderTextColor="#8c9293"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: '#8c9293', paddingHorizontal: 8 }}>?</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#b1cbd0" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>{filtered.length} components found</Text>

          <View style={styles.grid}>
            {filtered.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.card, selected?.id === c.id && styles.cardActive]}
                onPress={() => setSelected(selected?.id === c.id ? null : c)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardIcon}>{ICONS[c.name] ?? '??'}</Text>
                <Text style={styles.cardName} numberOfLines={2}>{c.name.replace(/_/g, ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selected && (
            <View style={styles.detail}>
              <View style={styles.detailTop}>
                <Text style={{ fontSize: 40 }}>{ICONS[selected.name] ?? '??'}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.detailName}>{selected.name.replace(/_/g, ' ')}</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Text style={{ color: '#8c9293', fontSize: 12 }}>? Close</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {[
                { icon: '??', title: 'Description', key: 'description' },
                { icon: '?', title: 'Function', key: 'function' },
                { icon: '??', title: 'Location', key: 'location' },
                { icon: '??', title: 'Troubleshooting', key: 'troubleshooting' },
              ].map(({ icon, title, key }) => (
                <View key={key} style={styles.section}>
                  <Text style={styles.sectionTitle}>{icon} {title}</Text>
                  <Text style={styles.sectionText}>{selected[key] ?? 'Not available.'}</Text>
                </View>
              ))}

              <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/tabs/scan')}>
                <Text style={styles.scanBtnText}>?? Scan this component</Text>
              </TouchableOpacity>
            </View>
          )}

          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 48, opacity: 0.3 }}>??</Text>
              <Text style={{ color: '#e5e2dd', fontSize: 18, fontWeight: '700', marginTop: 16 }}>No results found</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122b2f' },
  header: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: '#20201d', borderBottomWidth: 1, borderBottomColor: 'rgba(66,72,73,0.2)' },
  title: { fontSize: 24, fontWeight: '700', color: '#e5e2dd', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#8c9293' },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#2d4c4e', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(236,236,228,0.1)', paddingHorizontal: 16 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#e5e2dd' },
  content: { padding: 16, paddingTop: 0 },
  count: { fontSize: 11, color: '#8c9293', letterSpacing: 0.5, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  card: { width: '47%', backgroundColor: '#2d4c4e', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(236,236,228,0.08)' },
  cardActive: { borderColor: '#2a5fab', backgroundColor: '#1a3a5c' },
  cardIcon: { fontSize: 32 },
  cardName: { fontSize: 12, fontWeight: '600', color: '#e5e2dd', textAlign: 'center', lineHeight: 18 },
  detail: { backgroundColor: '#2d4c4e', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(42,95,171,0.4)', marginBottom: 16 },
  detailTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailName: { fontSize: 20, fontWeight: '700', color: '#e5e2dd', marginBottom: 4 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#aac7ff', marginBottom: 6 },
  sectionText: { fontSize: 13, color: '#c2c7c9', lineHeight: 20 },
  scanBtn: { backgroundColor: '#2a5fab', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
