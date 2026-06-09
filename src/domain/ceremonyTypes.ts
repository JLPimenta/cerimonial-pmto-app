import type { CeremonyType } from './types';

export const TIPOS_SOLENIDADE: CeremonyType[] = [
  { id: 'formatura', label: 'Formatura de Soldados', icon: 'school' },
  { id: 'promocao', label: 'Promoção de Oficiais', icon: 'military-tech' },
  { id: 'aniversario', label: 'Aniversário da Corporação', icon: 'cake' },
  { id: 'posse', label: 'Posse de Comando', icon: 'flag' },
  { id: 'medalhas', label: 'Entrega de Medalhas', icon: 'workspace-premium' },
];

export const ICONES_SOLENIDADE: string[] = [
  'event', 'military-tech', 'school', 'flag', 'workspace-premium', 'cake',
  'star', 'shield', 'verified', 'gavel', 'groups', 'emoji-events',
  'celebration', 'handshake', 'local-police', 'volunteer-activism', 'church', 'diversity-3',
  'campaign', 'sports-kabaddi', 'health-and-safety', 'park',
];
