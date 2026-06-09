import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ceremony } from '../domain/types';

const KEY = 'pmto_cerimonial_v1';

export async function loadCeremonies(): Promise<Ceremony[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Ceremony[];
  } catch {
    // Fail silently — offline-first, best-effort persistence
  }
  return [];
}

export async function saveCeremonies(ceremonies: Ceremony[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ceremonies));
  } catch {
    // Fail silently — offline-first, best-effort persistence
  }
}
