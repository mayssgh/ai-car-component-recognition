import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Animated, Easing, Alert, ActivityIndicator
} from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { pickImageFromGallery } from '../../utils/imageUtils'
import { useScan } from '../../hooks/useScan'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'

export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const { scanImage, loading, error } = useScan()
  const { user } = useAuthStore()
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)

  // Scanning line animation
  const scanAnim = useRef(new Animated.Value(0)).current
  // Pulse animation for shutter ring
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Scan line loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1, duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0, duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3, duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])
  const uploadImage = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  });

  try {
    const response = await fetch('http://localhost:8000/api/inference/predict', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const result = await response.json();
    console.log("Prediction:", result);
    // Update your state here to show the component name to the user
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  })

  const handleGallery = async () => {
    const uri = await pickImageFromGallery()
    if (uri) {
      setImageUri(uri)
      setShowCamera(false)
    }
  }

  const handleCapture = async () => {
    if (showCamera && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 })
        if (photo?.uri) setImageUri(photo.uri)
        setShowCamera(false)
      } catch {
        Alert.alert('Error', 'Failed to take photo')
      }
    } else if (imageUri) {
      handleScan()
    } else {
      if (!permission?.granted) {
        const result = await requestPermission()
        if (!result.granted) {
          Alert.alert('Permission needed', 'Camera access is required to scan components.')
          return
        }
      }
      setShowCamera(true)
    }
  }

  const handleScan = async () => {
    if (!imageUri) return
    try {
      await scanImage(imageUri)
      router.push('/result')
    } catch {
      setShowWarning(true)
    }
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
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

      {/* Viewfinder */}
      <View style={styles.viewfinder}>
        {showCamera ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.emptyViewfinder}>
            <Text style={styles.emptyViewfinderText}>
              Point camera at a car component
            </Text>
          </View>
        )}

        {/* Dark tint overlay */}
        <View style={styles.tint} />

        {/* Quality Warning */}
        {(showWarning || error) && (
          <TouchableOpacity
            style={styles.warningBanner}
            onPress={() => setShowWarning(false)}
          >
            <Text style={styles.warningIcon}>⚠️</Text>
            <View>
              <Text style={styles.warningTitle}>Image Quality Warning</Text>
              <Text style={styles.warningSubtitle}>
                {error || 'Ensure adequate lighting and focus'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Scan Brackets */}
        <View style={styles.bracketsContainer}>
          {/* Corners */}
          <View style={[styles.bracket, styles.topLeft]} />
          <View style={[styles.bracket, styles.topRight]} />
          <View style={[styles.bracket, styles.bottomLeft]} />
          <View style={[styles.bracket, styles.bottomRight]} />

          {/* Animated scan line */}
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineY }] }
            ]}
          />

          {/* Tech telemetry */}
          <View style={styles.telemetry}>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>STATUS</Text>
              <Text style={styles.telemetryValue}>
                {loading ? 'SCANNING' : showCamera ? 'LIVE' : imageUri ? 'READY' : 'STANDBY'}
              </Text>
            </View>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>MODE</Text>
              <Text style={styles.telemetryValue}>AI·DETECT</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>

        {/* Gallery Button */}
        <TouchableOpacity style={styles.sideButton} onPress={handleGallery}>
          <Text style={styles.sideButtonIcon}>🖼️</Text>
        </TouchableOpacity>

        {/* Shutter */}
        <View style={styles.shutterContainer}>
          <Animated.View
            style={[
              styles.shutterRing,
              { transform: [{ scale: pulseAnim }] }
            ]}
          />
          <TouchableOpacity
            style={styles.shutter}
            onPress={handleCapture}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <View style={styles.shutterInner}>
                <Text style={styles.shutterIcon}>
                  {showCamera ? '📸' : imageUri ? '🔍' : '⊙'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Flash / Reset */}
        <TouchableOpacity
          style={styles.sideButton}
          onPress={() => {
            setImageUri(null)
            setShowCamera(false)
            setShowWarning(false)
          }}
        >
          <Text style={styles.sideButtonIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Hint text */}
      <Text style={styles.hint}>
        {showCamera
          ? 'Tap shutter to capture'
          : imageUri
          ? 'Tap scan to analyze component'
          : 'Tap shutter to open camera or select from gallery'}
      </Text>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#20201d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(66,72,73,0.2)',
    zIndex: 10,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#b1cbd0',
    letterSpacing: -0.3,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2d4c4e',
    borderWidth: 1,
    borderColor: 'rgba(177,203,208,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b1cbd0',
  },

  // Viewfinder
  viewfinder: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyViewfinder: {
    flex: 1,
    backgroundColor: '#0e1a1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyViewfinderText: {
    color: 'rgba(194,199,201,0.3)',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  tint: {
  ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 43, 47, 0.15)',
  },

  // Warning
  warningBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(45, 76, 78, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(170,199,255,0.2)',
    padding: 12,
    zIndex: 20,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e2dd',
  },
  warningSubtitle: {
    fontSize: 11,
    color: '#c2c7c9',
    marginTop: 2,
  },

  // Brackets
  bracketsContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'rgba(170,199,255,0.6)',
    borderWidth: 3,
  },
  topLeft: {
    top: '20%',
    left: '10%',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: '20%',
    right: '10%',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: '20%',
    left: '10%',
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: '20%',
    right: '10%',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: '#aac7ff',
    shadowColor: '#aac7ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    top: '20%',
  },

  // Telemetry
  telemetry: {
    position: 'absolute',
    bottom: '18%',
    right: 16,
    gap: 8,
  },
  telemetryItem: {
    alignItems: 'flex-end',
  },
  telemetryLabel: {
    fontSize: 9,
    color: 'rgba(170,199,255,0.5)',
    letterSpacing: 1,
  },
  telemetryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aac7ff',
    letterSpacing: 0.5,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: '#1c1c19',
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 76, 78, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(236, 236, 228, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonIcon: {
    fontSize: 20,
  },
  shutterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(170,199,255,0.3)',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#004792',
    borderWidth: 4,
    borderColor: '#1c1c19',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2a5fab',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIcon: {
    fontSize: 24,
  },

  // Hint
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(194,199,201,0.5)',
    letterSpacing: 0.5,
    paddingVertical: 8,
    backgroundColor: '#1c1c19',
    paddingBottom: 12,
  },
})