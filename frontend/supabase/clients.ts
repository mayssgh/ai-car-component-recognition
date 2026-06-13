import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey as string

export const supabase = createClient(supabaseUrl, supabaseKey)