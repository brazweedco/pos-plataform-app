import { Platform } from "react-native";

// Simple in-memory storage fallback for native
// In production, replace with expo-secure-store or @react-native-async-storage/async-storage
const memoryStorage: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    // For native, use in-memory storage (tokens won't persist across app restarts)
    // TODO: Replace with expo-secure-store for production
    return memoryStorage[key] ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    memoryStorage[key] = value;
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    delete memoryStorage[key];
  },
};
