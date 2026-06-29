import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Platform, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Smart environment cross-platform IP routing configuration
  const getBackendURL = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000'
    return 'http://127.0.0.1:8000'
  }

  // Safe lens engine configuration block
  const captureFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert('Permission Rejected', 'App context requires native lens permissions to snap parts.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Camera module boot aborted:", error)
      Alert.alert(
        "Hardware Lens Error", 
        "If you are on a computer emulator, please use the gallery option instead!"
      )
    }
  }

  // Modernized photo album data picker block
  const pickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert('Permission Rejected', 'Media library access is required to view saved captures.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Gallery frame allocation failed:", error)
      Alert.alert("Gallery Error", "Could not safely open the system photos picker.")
    }
  }

  // Multi-part payload server delivery sequence
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

      const response = await fetch(`${getBackendURL()}/api/inference/predict`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
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
        Alert.alert("Inference Failed", result.detail || 'Unknown server database parsing issue.')
      }
    } catch (error) {
      console.error("Network Connection Failure:", error)
      Alert.alert(
        "Server Connection Lost", 
        "Failed to touch the AI engine. Verify your Python backend dashboard server is active."
      )
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
        {/* Two dedicated direct input management buttons row */}
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
  actionGroup: { width: '100%', gap: 16 },
  rowButtons: { flexDirection: 'row', width: '100%', gap: 12 },
  choiceBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexDirection: 'row', gap: 6 },
  cameraBtn: { backgroundColor: '#2d4c4e', borderColor: 'rgba(230,232,231,0.1)' },
  galleryBtn: { backgroundColor: '#20201d', borderColor: 'rgba(236,236,228,0.1)' },
  btnIcon: { fontSize: 16 },
  choiceBtnText: { color: '#ecece4', fontSize: 14, fontWeight: '600' },
  primaryBtn: { backgroundColor: '#2a5fab', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#ecece4', fontSize: 16, fontWeight: '700' }
})