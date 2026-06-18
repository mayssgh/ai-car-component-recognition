import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAdminLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all security fields')
      return
    }
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://127.0.0.1:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.status === 200) {
        router.replace('/admin/dashboard')
      } else {
        setError(data.detail || 'Access Denied')
      }
    } catch (e) {
      setError('Connection failure to secure gateway')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>System Control Terminal</Text>
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ROOT EMAIL</Text>
          <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            placeholder="admin@carrecon.com" 
            placeholderTextColor="#8c9293" 
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>SECURITY KEY ACCESS</Text>
          <TextInput 
            style={styles.input} 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            placeholder="••••••••" 
            placeholderTextColor="#8c9293" 
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAdminLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#ecece4"/> : <Text style={styles.buttonText}>Initialize Connection</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c19' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#ecece4', marginBottom: 30, textAlign: 'center' },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '600', color: '#c2c7c9', marginBottom: 8, letterSpacing: 1 },
  input: { 
    backgroundColor: '#2d4c4e', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(230, 232, 231, 0.2)', 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    color: '#e5e2dd',
    ...Platform.select({ web: { outlineStyle: 'none' } })
  },
  button: { backgroundColor: '#2a5fab', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ecece4', fontSize: 16, fontWeight: '700' },
  error: { color: '#ff6b6b', textAlign: 'center', marginBottom: 15, fontSize: 14 }
})