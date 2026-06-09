import type { Ceremony } from './types';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function fmtData(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d} ${MESES[parseInt(m, 10) - 1]} ${y}`;
}

export function hojeISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

export function agoraHM(): string {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
}

export function solNoPassado(sol: Ceremony): boolean {
  return !!sol && sol.data < hojeISO();
}

export function termoTribuna(sol: Ceremony): string {
  return sol.tipoLocal === 'auditorio' && sol.mesaExpressa ? 'Mesa de Honra' : 'Tribuna de Honra';
}
