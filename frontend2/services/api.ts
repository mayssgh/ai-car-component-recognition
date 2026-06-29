import axios from 'axios'
import { useAuthStore } from '../store/auth.store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native' // Import the platform identifier tool

// Smart IP routing selector:
// 1. Android Emulators require the 10.0.2.2 proxy gate to see your laptop.
// 2. iOS Simulators can read localhost/127.0.0.1 directly.
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000'
  }
  return 'http://127.0.0.1:8000'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically intercept every outgoing network request and attach the User Token
api.interceptors.request.use(
  async (config) => {
    let token = useAuthStore.getState().token

    if (!token) {
      try {
        token = await AsyncStorage.getItem('token')
      } catch (e) {
        console.log("Could not read from AsyncStorage inside API interceptor", e)
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Dynamic logging to track outbound calls in your terminal console
    console.log(`📡 Sending [${config.method?.toUpperCase()}] to: ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api