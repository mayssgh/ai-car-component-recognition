import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { Colors } from '../../constants/colors'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, loading } = useAuthStore()
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    try {
      setError(null)
      await login(email, password)
      router.replace('/tabs/scan')
    } catch (e: any) {
      setError('Invalid email or password')
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
            <Text style={styles.logoIcon}>📷</Text>
          </View>
          <Text style={styles.brandName}>BakoVision</Text>
          <Text style={styles.brandTagline}>AI Component Intelligence</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>WORK EMAIL</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="engineer@bakovision.ai"
                placeholderTextColor={Colors.dark.subtext}
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
            <View style={styles.labelRow}>
              <Text style={styles.label}>SECURITY KEY</Text>
              <TouchableOpacity onPress={() => router.push('/auth/reset-password')}>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor={Colors.dark.subtext}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>

          {/* Error */}
          {error && <Text style={styles.error}>{error}</Text>}

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.dark.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In →</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.secondaryButtonText}>
              Don't have an account?{' '}
              <Text style={styles.linkText}>Register</Text>
            </Text>
          </TouchableOpacity>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Authorized access only.{'\n'}
            v1.0.0 • System Status:{' '}
            <Text style={styles.statusText}>Operational</Text>
          </Text>
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

  // Background blobs
  blobTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(42, 95, 171, 0.08)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
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
    fontSize: 36,
    fontWeight: '700',
    color: '#e5e2dd',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(194, 199, 201, 0.8)',
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(45, 76, 78, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 236, 228, 0.1)',
    padding: 32,
  },

  // Fields
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    color: '#c2c7c9',
    marginBottom: 4,
    marginLeft: 4,
  },
  forgotLink: {
    fontSize: 12,
    color: '#2a5fab',
    fontWeight: '500',
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(230, 232, 231, 0.2)',
    backgroundColor: '#2d4c4e',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: '#d4d1cc',
    letterSpacing: 0.5,
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
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    color: '#c2c7c9',
  },

  // Secondary
  secondaryButton: {
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#c2c7c9',
  },
  linkText: {
    color: '#2a5fab',
    fontWeight: '600',
  },

  // Footer
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(194, 199, 201, 0.4)',
    textAlign: 'center',
    lineHeight: 18,
  },
  statusText: {
    color: '#a6d1b3',
  },
})