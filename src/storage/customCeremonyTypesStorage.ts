import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CeremonyType } from '../domain/types';

const KEY = 'pmto_custom_tipo_v1';

export async function loadCustomCeremonyTypes(): Promise<CeremonyType[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as CeremonyType[];
  } catch {
    // Fall through
  }
  return [];
}

export async function saveCustomCeremonyTypes(list: CeremonyType[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Fail silently
  }
}

export function buildCustomCeremonyType(label: string, icon: string): CeremonyType {
  return {
    id: 't' + Date.now(),
    label: label.trim().slice(0, 100),
    icon,
    custom: true,
  };
}
