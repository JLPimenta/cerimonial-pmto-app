import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ceremony } from '../domain/types';

const KEY = 'pmto_cerimonial_v1';

const SEED: Ceremony[] = [
  {
    id: 's1',
    tipo: 'formatura',
    nome: 'Formatura do Curso de Formação de Soldados 2026',
    data: '2026-06-20',
    hora: '09:00',
    local: 'Pátio do Comando-Geral da PMTO',
    cidade: 'Palmas/TO',
    tipoLocal: 'aberto',
    mesaExpressa: false,
    totalCadeiras: 15,
    presentIds: ['governador', 'cmtgeral', 'secseg', 'prestj', 'pgj', 'presale', 'prefeito', 'dpge', 'mpf', 'vice', 'desemb', 'depest', 'oabto', 'cmtcbm', 'religioso'],
    override: null,
  },
  {
    id: 's2',
    tipo: 'medalhas',
    nome: 'Entrega da Medalha Tiradentes',
    data: '2026-07-10',
    hora: '19:30',
    local: 'Auditório do Palácio Araguaia',
    cidade: 'Palmas/TO',
    tipoLocal: 'auditorio',
    mesaExpressa: true,
    totalCadeiras: 11,
    presentIds: ['cmtgeral', 'secseg', 'prestj', 'pgj', 'prefeito', 'subcmt', 'oabto', 'corpm', 'dpge', 'mpf', 'religioso'],
    override: null,
  },
  {
    id: 's3',
    tipo: 'posse',
    nome: 'Posse do Novo Comando-Geral da PMTO',
    data: '2026-08-02',
    hora: '10:00',
    local: 'Pátio do Quartel do Comando-Geral',
    cidade: 'Palmas/TO',
    tipoLocal: 'aberto',
    mesaExpressa: false,
    totalCadeiras: 13,
    presentIds: ['governador', 'cmtgeral', 'secseg', 'vice', 'presale', 'prestj', 'pgj', 'prefeito', 'subcmt', 'dpge', 'mpf', 'depfed', 'senador'],
    override: null,
  },
];

export async function loadCeremonies(): Promise<Ceremony[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Ceremony[];
  } catch {
    // Fall through to seed data
  }
  return SEED;
}

export async function saveCeremonies(ceremonies: Ceremony[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ceremonies));
  } catch {
    // Fail silently — offline-first, best-effort persistence
  }
}
