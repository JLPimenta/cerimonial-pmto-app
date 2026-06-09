import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Authority, EsferaKey } from '../domain/types';
import { iniciaisDe, PREC_POR_ESFERA } from '../domain/catalog';

const KEY = 'pmto_custom_aut_v1';

export async function loadCustomAuthorities(): Promise<Authority[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Authority[];
  } catch {
    // Fall through
  }
  return [];
}

export async function saveCustomAuthorities(list: Authority[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Fail silently
  }
}

export function buildCustomAuthority(cargo: string, esfera: EsferaKey): Authority {
  const nome = cargo.trim().slice(0, 150);
  return {
    id: 'c' + Date.now(),
    nome,
    cargo: nome,
    orgao: 'Cadastro manual',
    esfera,
    prec: (PREC_POR_ESFERA[esfera] ?? 23) + 0.5,
    ini: iniciaisDe(nome),
    custom: true,
  };
}
