import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, Dimensions } from 'react-native'
import { useAuthStore } from '../../store/auth.store'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function ProfileScreen() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  // Profile Form States
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('Mayssa Ghabarou')
  const [email, setEmail] = useState(user?.email ?? 'operator@bakovision.ai')
  const [updating, setUpdating] = useState(false)

  // Live Server States
  const [serverOnline, setServerOnline] = useState(false)
  const [totalScans, setTotalScans] = useState(0)
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch Real Data from Local Backend on Load
  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setServerOnline(true)
          setTotalScans(data.total_items || data.count || 0)
        } else {
          setServerOnline(false)
        }
      } catch (e) {
        setServerOnline(false)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchBackendStatus()
  }, [])

  // Profile Save Request to Backend API
  const handleSaveProfile = async () => {
    setUpdating(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully on the server.")
        setIsEditing(false)
      } else {
        Alert.alert("Error", "Server rejected profile update.")
      }
    } catch (e) {
      Alert.alert("Connection Failed", "Could not reach backend to save profile changes.")
    } finally {
      setUpdating(false)
    }
  }

  // Absolute Clear Logout Sequence
  const executeLogoutWipe = async () => {
    try {
      // 1. Wipe all local token keys instantly
      await AsyncStorage.multiRemove(['token', 'user_session', 'access_token', 'user'])
    } catch (e) {
      console.log("Storage bypass")
    }

    try {
      // 2. Fire the programmatic logout state mutation
      await logout()
    } catch (error) {
      console.log("Store logout exception caught")
    }

    // 3. Absolute manual fallback to break route guards instantly
    useAuthStore.setState({ 
      user: null, 
      isAuthenticated: false, 
      loading: false 
    })

    // 4. Force router to clear historical stack context back to login portal
    setTimeout(() => {
      router.replace('/auth/login')
    }, 50)
  }

  const handleLogoutPress = () => {
    // If native Alerts are being swallowed by root screen hierarchies, 
    // we bypass the alert entirely and drop straight into the wipe logic.
    executeLogoutWipe()
  }

  return (
    <View style={styles.container}>
      {/* Upper Profile View Container */}
      <View style={styles.contentWrapper}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            <View style={[styles.onlineDot, { backgroundColor: serverOnline ? '#a6d1b3' : '#ff6b6b' }]} />
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#8c9293" />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#8c9293" autoCapitalize="none" />
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={updating}>
                {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save to Backend</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{email}</Text>
              <TouchableOpacity style={styles.editBadge} onPress={() => setIsEditing(true)}>
                <Text style={styles.editBadgeText}>⚙️ Edit Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Real Statistics Display Box */}
        <Text style={styles.menuTitle}>Live App Summary</Text>
        <View style={styles.statsCard}>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>Backend Connection Status</Text>
            <Text style={[styles.statValue, { color: serverOnline ? '#a6d1b3' : '#ff6b6b' }]}>
              {serverOnline ? 'Connected' : 'Offline'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>Total Saved Inventory Items</Text>
            {loadingStats ? (
              <ActivityIndicator size="small" color="#aac7ff" />
            ) : (
              <Text style={[styles.statValue, { color: '#aac7ff' }]}>{totalScans} Items</Text>
            )}
          </View>
        </View>

        {/* Navigation Panels */}
        <Text style={styles.menuTitle}>Navigation</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/dashboard')}>
            <Text style={styles.menuItemText}>📊 View Dashboard Analytics</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Explicitly Isolated Interactive Footer Panel */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Log Out Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#122b2f',
    justifyContent: 'space-between'
  },
  contentWrapper: { 
    paddingHorizontal: 24, 
    paddingTop: SCREEN_HEIGHT * 0.07
  },
  profileHeader: { 
    alignItems: 'center', 
    marginBottom: 20, 
    width: '100%' 
  },
  avatar: { 
    width: 84, 
    height: 84, 
    borderRadius: 42, 
    backgroundColor: '#20201d', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#2a5fab', 
    marginBottom: 12, 
    position: 'relative' 
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#b1cbd0' },
  onlineDot: { 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    borderWidth: 2, 
    borderColor: '#122b2f' 
  },
  userName: { fontSize: 22, fontWeight: '700', color: '#ecece4', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#8c9293' },
  
  editBadge: { 
    backgroundColor: '#1a3a3e', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginTop: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(236,236,228,0.1)' 
  },
  editBadgeText: { color: '#aac7ff', fontSize: 12, fontWeight: '600' },

  editForm: { width: '100%', marginTop: 10 },
  input: { 
    backgroundColor: '#1a3a3e', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(236,236,228,0.12)', 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    color: '#ecece4', 
    fontSize: 15, 
    marginBottom: 10 
  },
  saveBtn: { backgroundColor: '#2a5fab', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  menuTitle: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#8c9293', 
    textTransform: 'uppercase', 
    letterSpacing: 1.5, 
    marginTop: 24, 
    marginBottom: 8, 
    paddingLeft: 4 
  },
  statsCard: { 
    backgroundColor: 'rgba(32, 32, 29, 0.6)', 
    borderRadius: 14, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(236,236,228,0.06)' 
  },
  statLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  statLabel: { color: '#ecece4', fontSize: 14 },
  statValue: { 
    fontSize: 14, 
    fontWeight: '600', 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },

  menuGroup: { 
    backgroundColor: 'rgba(32, 32, 29, 0.6)', 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(236,236,228,0.06)' 
  },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  menuItemText: { fontSize: 15, color: '#ecece4', fontWeight: '500' },
  arrow: { fontSize: 20, color: '#8c9293', fontWeight: '300' },
  divider: { height: 1, backgroundColor: 'rgba(236,236,228,0.06)', marginVertical: 8 },

  // Base Footer Panel Layout
  footerContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
    width: '100%',
    zIndex: 99,
  },
  logoutButton: { 
    backgroundColor: 'rgba(115, 53, 53, 0.25)', 
    borderWidth: 1, 
    borderColor: '#963f3f', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center',
    width: '100%'
  },
  logoutText: { color: '#fca5a5', fontSize: 15, fontWeight: '600' }
})