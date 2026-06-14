import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { authService } from '../../services/auth.service'
import { Colors } from '../../constants/colors'

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async () => {
    setError(null)

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const { error } = await authService.register(email, password, fullName)
      if (error) throw error
      router.replace('/tabs/scan')
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please try again.')
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
        <View style={styles.blobTopLeft} />
        <View style={styles.blobBottomRight} />

        {/* Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>📷</Text>
          </View>
          <Text style={styles.brandName}>BakoVision</Text>
          <Text style={styles.brandTagline}>Next-gen Automotive Intelligence</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Initialize Account</Text>
            <Text style={styles.cardSubtitle}>Enter your credentials to begin.</Text>
          </View>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>👤  FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Johnathan Doe"
                placeholderTextColor="rgba(194,199,201,0.3)"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>✉️  EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="engineer@fleet.bakovision.com"
                placeholderTextColor="rgba(194,199,201,0.3)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>🔒  PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(194,199,201,0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>✅  CONFIRM PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(194,199,201,0.3)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
          </View>

          {/* Error */}
          {error && <Text style={styles.error}>{error}</Text>}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ecece4" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account →</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>SECURE ENCRYPTED HANDSHAKE</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginLinkText}>
              Already part of the fleet?{' '}
              <Text style={styles.linkText}>Log in</Text>
            </Text>
          </TouchableOpacity>
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
  blobTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(42, 95, 171, 0.08)',
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(4, 46, 26, 0.15)',
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
    backgroundColor: '#2a5fab',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2a5fab',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#e5e2dd',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(194, 199, 201, 0.8)',
    letterSpacing: 0.5,
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(45, 76, 78, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(236, 236, 228, 0.1)',
    padding: 32,
  },
  cardHeader: {
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e5e2dd',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#c2c7c9',
  },

  // Fields
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

  // Button
  primaryButton: {
    backgroundColor: '#2a5fab',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
    shadowColor: '#2a5fab',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ecece4',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(236, 236, 228, 0.1)',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: 'rgba(194, 199, 201, 0.4)',
  },

  // Login link
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#c2c7c9',
  },
  linkText: {
    color: '#2a5fab',
    fontWeight: '700',
  },
})