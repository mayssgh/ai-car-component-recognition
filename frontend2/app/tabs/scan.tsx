import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Platform, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Dynamic network routing fallback matrix
  const getBackendURL = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000' // Android Emulator target loop
    if (Platform.OS === 'web') return 'http://127.0.0.1:8000'     // 🌟 FIXED: Target localhost for local web environments
    return 'http://172.29.224.1'                                  // Physical phone Wi-Fi link target
  }

  const captureFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
      if (!permissionResult.granted) {
        alert('Camera permissions are required to snap engine parts.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6, // Compressed slightly to decrease upload processing delays
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Camera crashed:", error)
    }
  }

  const pickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        alert('Gallery access is required.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Gallery failed:", error)
    }
  }

  const handleRecognizeComponent = async () => {
    if (!imageUri) return

    try {
      setLoading(true)
      const formData = new FormData()

      // 🌟 FIXED: Convert local asset URI into raw binary Blob matrix for Web engines
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

      const response = await fetch(`${getBackendURL()}/api/inference/predict`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }, 
        // ⚠️ NEVER hardcode Content-Type: multipart/form-data headers on web.
        // Let the web browser native subsystem inject the unique multi-part boundaries.
      })

      const result = await response.json()

      if (response.ok) {
        router.push({
          pathname: '/result',
          params: {
            partName: result.component,
            confidence: result.confidence_percentage,
            latency: result.server_latency,
            imageUri: imageUri 
          }
        })
      } else {
        const errorMsg = result.detail || 'Inference failure.'
        Platform.OS === 'web' ? alert(`Server Error: ${errorMsg}`) : Alert.alert("Server Error", errorMsg)
      }
    } catch (error) {
      console.error("Connection failed:", error)
      Platform.OS === 'web' ? alert("Offline: Failed to reach backend server loop.") : Alert.alert("Offline", "Failed to reach backend server loop.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Component Scanner</Text>
        <Text style={styles.subtitle}>Scan or upload a component for real-time inference mapping</Text>
      </View>

      <View style={styles.previewBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.placeholderText}>No model loaded</Text>
        )}
      </View>

      <View style={styles.actionGroup}>
        <View style={styles.rowButtons}>
          <TouchableOpacity style={[styles.choiceBtn, styles.cameraBtn]} onPress={captureFromCamera} disabled={loading}>
            <Text style={styles.btnIcon}>📸</Text>
            <Text style={styles.choiceBtnText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.choiceBtn, styles.galleryBtn]} onPress={pickFromGallery} disabled={loading}>
            <Text style={styles.btnIcon}>📁</Text>
            <Text style={styles.choiceBtnText}>Open Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRecognizeComponent} disabled={loading}>
            {loading ? <ActivityIndicator color="#ecece4" /> : <Text style={styles.primaryBtnText}>Analyze Component ➔</Text>}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c19' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  header: { marginBottom: 30, width: '100%' },
  title: { fontSize: 24, fontWeight: '700', color: '#ecece4', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#8c9293', marginTop: 6, textAlign: 'center', lineHeight: 18 },
  previewBox: { width: '100%', aspectRatio: 4 / 3, backgroundColor: '#20201d', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(236,236,228,0.06)', overflow: 'hidden', marginBottom: 30 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderText: { color: '#8c9293', fontSize: 14 },
  actionGroup: { width: '100%', gap: 16 },
  rowButtons: { flexDirection: 'row', width: '100%', gap: 12 },
  choiceBtn: { flex: 1, borderRadius: 12, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexDirection: 'row', gap: 8 },
  cameraBtn: { backgroundColor: '#2d4c4e', borderColor: 'rgba(230,232,231,0.1)' },
  galleryBtn: { backgroundColor: '#20201d', borderColor: 'rgba(236,236,228,0.1)' },
  btnIcon: { fontSize: 16 },
  choiceBtnText: { color: '#ecece4', fontSize: 14, fontWeight: '600' },
  primaryBtn: { backgroundColor: '#2a5fab', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#ecece4', fontSize: 16, fontWeight: '700' }
})