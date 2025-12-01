import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto'; // 👈 Keep this! Essential for File Uploads.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Safety check
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be provided in .env');
}

// 1. Create a Custom Storage Adapter for Native
const ExpoStorage = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 2. Use the wrapper on Native, default (localStorage) on Web
    storage: Platform.OS === 'web' ? undefined : ExpoStorage,
    autoRefreshToken: true,
    persistSession: true,
    
    // 3. IMPORTANT: Only detect URL sessions on Web. 
    // On Native, this confuses the Deep Linking mechanism.
    detectSessionInUrl: Platform.OS === 'web', 
  },
});