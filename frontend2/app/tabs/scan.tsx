import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Pick an image from the device gallery or file explorer
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri)
    }
  }

  // Core background multi-part image network delivery stream
  const handleRecognizeComponent = async () => {
    if (!imageUri) return

    try {
      setLoading(true)
      const formData = new FormData()

      if (Platform.OS === 'web') {
        const response = await fetch(imageUri)
        const blob = await response.blob()
        formData.append('file', blob, 'component_capture.jpg')
      } else {
        formData.append('file', {
          uri: imageUri,
          name: 'component_capture.jpg',
          type: 'image/jpeg',
        } as any)
      }

      // Hit your verified ONNX runtime endpoint route
      const response = await fetch('http://127.0.0.1:8000/api/inference/predict', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      })

      const result = await response.json()

      if (response.ok) {
        // SUCCESS: Route to the results board, passing the local imageUri along!
        router.push({
          pathname: '/result',
          params: {
            partName: result.component,
            confidence: result.confidence_percentage,
            latency: result.server_latency,
            imageUri: imageUri // <-- Added this key to pass the image along!
          }
        })
      } else {
        alert(`Inference failed: ${result.detail || 'Unknown server error'}`)
      }
    } catch (error) {
      console.error("Network Link Error:", error)
      alert("Failed to connect to the AI Inference Server. Ensure your backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Component Scanner</Text>
        <Text style={styles.subtitle}>Upload or capture an automotive part for real-time model analysis</Text>
      </View>

      <View style={styles.previewBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.placeholderText}>No engine component image loaded</Text>
        )}
      </View>

      <View style={styles.actionGroup}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage} disabled={loading}>
          <Text style={styles.secondaryBtnText}>Select Image File</Text>
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRecognizeComponent} disabled={loading}>
            {loading ? <ActivityIndicator color="#ecece4" /> : <Text style={styles.primaryBtnText}>Analyze Component</Text>}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c19' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 50, paddingBottom: 40, alignItems: 'center' },
  header: { marginBottom: 30, width: '100%' },
  title: { fontSize: 24, fontWeight: '700', color: '#ecece4', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#8c9293', marginTop: 6, textAlign: 'center', lineHeight: 18 },
  previewBox: { 
    width: '100%', 
    aspectRatio: 4 / 3, 
    backgroundColor: '#20201d', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(236,236,228,0.06)', 
    overflow: 'hidden',
    marginBottom: 30 
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderText: { color: '#8c9293', fontSize: 14 },
  actionGroup: { width: '100%', gap: 14 },
  primaryBtn: { backgroundColor: '#2a5fab', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#ecece4', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#2d4c4e', borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(230,232,231,0.1)' },
  secondaryBtnText: { color: '#ecece4', fontSize: 16, fontWeight: '600' }
})