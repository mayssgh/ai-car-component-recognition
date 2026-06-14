import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { authService } from '../../services/auth.service'
import { Colors } from '../../constants/colors'

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await authService.resetPassword(email)
      setSent(true)
    } catch (e: any) {
      setError(e.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background blobs */}
        <View style={styles.blobTopRight} />
        <View style={styles.blobBottomLeft} />

        {/* Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🔐</Text>
          </View>
          <Text style={styles.brandName}>BakoVision</Text>
          <Text style={styles.brandTagline}>Reset your password</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {sent ? (
            /* Success State */
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successText}>
                Check your inbox for a password reset link.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/auth/login')}
              >
                <Text style={styles.primaryButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Forgot Password?</Text>
                <Text style={styles.cardSubtitle}>
                  Enter your email and we'll send you a reset link.
                </Text>
              </View>

              {/* Email Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>✉️  EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="engineer@bakovision.ai"
                    placeholderTextColor="rgba(194,199,201,0.3)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Error */}
              {error && <Text style={styles.error}>{error}</Text>}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabled]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#ecece4" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Reset Link →</Text>
                )}
              </TouchableOpacity>

              {/* Back to login */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>
                  ← Back to Login
                </Text>
              </TouchableOpacity>
            </>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122b2f',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 48,
  },

  // Blobs
  blobTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(42, 95, 171, 0.07)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(166, 209, 179, 0.04)',
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2d4c4e',
    borderWidth: 1,
    borderColor: 'rgba(236,236,228,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#e5e2dd',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(194, 199, 201, 0.8)',
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(45, 76, 78, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(236, 236, 228, 0.1)',
    padding: 32,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e5e2dd',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#c2c7c9',
    lineHeight: 22,
  },

  // Field
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#c2c7c9',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(230, 232, 231, 0.2)',
    backgroundColor: 'rgba(45, 76, 78, 0.5)',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#e5e2dd',
  },

  // Error
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#2a5fab',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
  },
  primaryButtonText: {
    color: '#ecece4',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: '#c2c7c9',
  },

  // Success
  successContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e5e2dd',
  },
  successText: {
    fontSize: 14,
    color: '#c2c7c9',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
})