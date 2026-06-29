import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function IntegratedAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'static'>('realtime');
  const [filterThreshold, setFilterThreshold] = useState<number>(80);

  // SVG configuration math for the circle ring gauge
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (filterThreshold / 100) * circumference;

  const recognizedParts = [
    { name: 'Alternator Motor', precision: '96.2%', status: 'Optimal' },
    { name: 'Brake Caliper', precision: '92.4%', status: 'Optimal' },
    { name: 'Radiator Core', precision: '89.1%', status: 'Needs Lighting' },
    { name: 'Serpentine Belt', precision: '95.0%', status: 'Optimal' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.title}>Inference Engine Metrics</Text>
        <Text style={styles.subtitle}>BakoVision Model V1.4.2 Active</Text>
      </View>

      {/* SEGMENTED CONTROLLER */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'realtime' && styles.activeTab]} 
          onPress={() => setActiveTab('realtime')}
        >
          <Text style={styles.chipText}>Live Telemetry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'static' && styles.activeTab]} 
          onPress={() => setActiveTab('static')}
        >
          <Text style={styles.chipText}>Matrix Analytics</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'realtime' ? (
        <>
          {/* HIGH LEVEL CONFIDENCE FILTER GAUGE */}
          <View style={styles.componentCard}>
            <Text style={styles.componentName}>Dynamic Confidence Threshold</Text>
            <Text style={styles.bodyDescription}>
              Filters low-probability inferences to minimize environmental noise in engine bays.
            </Text>

            <View style={styles.gaugeWrapper}>
              <svg width="140" height="140" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(236,236,228,0.08)" strokeWidth={strokeWidth} />
                <circle 
                  cx="60" 
                  cy="60" 
                  r={radius} 
                  fill="transparent" 
                  stroke="#2a5fab" 
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <View style={styles.gaugeTextPos}>
                <Text style={styles.gaugeNumber}>{filterThreshold}%</Text>
                <Text style={styles.gaugeMin}>Cutoff</Text>
              </View>
            </View>

            <input 
              type="range" 
              min="65" 
              max="98" 
              value={filterThreshold} 
              onChange={(e) => setFilterThreshold(Number(e.target.value))}
              style={styles.htmlSlider}
            />

            <View style={styles.symptomBox}>
              <Text style={styles.symptomTitle}>Operational Profile</Text>
              <Text style={styles.symptomText}>
                {filterThreshold > 88 
                  ? "🔒 High Precision: Minimizes misclassifications, requires perfect light levels." 
                  : "⚡ High Recall: Faster matching speed, vulnerable to background chassis shadows."}
              </Text>
            </View>
          </View>

          {/* PIPELINE LATENCY PERFORMANCE CARD */}
          <View style={styles.componentCard}>
            <Text style={styles.componentName}>Compute Pipeline Latency</Text>
            
            <View style={styles.chartContainer}>
              <View style={styles.barGroup}>
                <View style={styles.barLabelWrapper}>
                  <Text style={styles.barLabel}>Frame Downsample</Text>
                  <Text style={styles.barValue}>32ms</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fillBar, { width: '28%', backgroundColor: '#b1cbd0' }]} />
                </View>
              </View>

              <View style={styles.barGroup}>
                <View style={styles.barLabelWrapper}>
                  <Text style={styles.barLabel}>Tensor Inference Pass</Text>
                  <Text style={styles.barValue}>114ms</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fillBar, { width: '85%', backgroundColor: '#2a5fab' }]} />
                </View>
              </View>

              <View style={styles.barGroup}>
                <View style={styles.barLabelWrapper}>
                  <Text style={styles.barLabel}>Metadata Extraction</Text>
                  <Text style={styles.barValue}>12ms</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fillBar, { width: '12%', backgroundColor: '#eb5e55' }]} />
                </View>
              </View>
            </View>
          </View>
        </>
      ) : (
        /* CLASSIFICATION SPECIFIC MATRIX BREAKDOWN */
        <View style={styles.componentCard}>
          <Text style={styles.componentName}>Class-Specific Performance</Text>
          <Text style={styles.bodyDescription}>Validation dataset precision checkpoints across your targeted vision classes.</Text>
          
          <View style={styles.tableWrapper}>
            {recognizedParts.map((part, index) => (
              <View key={index} style={[styles.tableRow, index === recognizedParts.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.tablePartName}>{part.name}</Text>
                <View style={styles.tableMetricGroup}>
                  <Text style={styles.tableMetricVal}>{part.precision}</Text>
                  <Text style={styles.categoryTag}>{part.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122b2f' },
  content: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#ecece4' },
  subtitle: { fontSize: 13, color: '#8c9293', marginTop: 4, marginBottom: 16 },
  
  // Tab Segments
  tabBar: { flexDirection: 'row', backgroundColor: '#1c1c19', borderRadius: 10, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(236,236,228,0.08)' },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#2a5fab' },
  chipText: { color: '#ecece4', fontSize: 13, fontWeight: '500' },

  // Cards Structures
  componentCard: { backgroundColor: 'rgba(28,28,25,0.6)', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(236,236,228,0.05)' },
  componentName: { fontSize: 18, fontWeight: '700', color: '#ecece4', marginBottom: 6 },
  bodyDescription: { fontSize: 13, color: '#b1cbd0', lineHeight: 18, marginBottom: 12 },
  
  // Custom Gauge Core UI
  gaugeWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative', marginVertical: 12 },
  gaugeTextPos: { position: 'absolute', top: '33%', alignItems: 'center', justifyContent: 'center', width: '100%' },
  gaugeNumber: { fontSize: 28, fontWeight: '800', color: '#ecece4', textAlign: 'center' },
  gaugeMin: { fontSize: 11, color: '#8c9293', textTransform: 'uppercase', marginTop: 2, textAlign: 'center' },
  htmlSlider: { width: '100%', marginTop: 16, cursor: 'pointer', accentColor: '#2a5fab' },
  
  // Operational Alert Boxes
  symptomBox: { backgroundColor: 'rgba(235, 94, 85, 0.08)', borderRadius: 8, padding: 10, marginTop: 16, borderWidth: 1, borderColor: 'rgba(235, 94, 85, 0.15)' },
  symptomTitle: { fontSize: 12, fontWeight: '700', color: '#eb5e55', marginBottom: 2 },
  symptomText: { fontSize: 12, color: '#ecece4', lineHeight: 16 },

  // Latency Bars Graph
  chartContainer: { marginTop: 4 },
  barGroup: { marginBottom: 14 },
  barLabelWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13, color: '#b1cbd0', fontWeight: '500' },
  barValue: { fontSize: 12, color: '#8c9293', fontWeight: '600' },
  track: { height: 6, backgroundColor: '#1c1c19', borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(236,236,228,0.05)' },
  fillBar: { height: '100%', borderRadius: 3 },

  // Data Lists & Matrices
  tableWrapper: { marginTop: 4, backgroundColor: '#1c1c19', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(236,236,228,0.05)' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(236,236,228,0.05)' },
  tablePartName: { fontSize: 14, fontWeight: '500', color: '#ecece4' },
  tableMetricGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tableMetricVal: { fontSize: 14, fontWeight: '700', color: '#aac7ff' },
  categoryTag: { fontSize: 11, color: '#b1cbd0', backgroundColor: 'rgba(45,76,78,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' }
});