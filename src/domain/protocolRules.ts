import type { Authority, Ceremony, ProtocolResult, SeatArrangement } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// RECONCILIAÇÃO DE OVERRIDE
// Quando há ajuste manual (override), reconcilia com os presentIds atuais:
// - Remove IDs que não estão mais presentes
// - Insere IDs novos (adicionados após o override) na posição protocolar
// ─────────────────────────────────────────────────────────────────────────────
export function reconciliarOrdem(
  sol: Ceremony,
  prot: ProtocolResult,
  authById: (id: string) => Authority | undefined,
): Authority[] {
  if (!sol.override) return prot.ordem;
  const presentSet = new Set(sol.presentIds);
  const cleanOverride = sol.override.filter(id => presentSet.has(id));
  const overrideSet = new Set(cleanOverride);
  const missing = sol.presentIds.filter(id => !overrideSet.has(id));
  const fullIds = [...cleanOverride];
  for (const id of missing) {
    const protIdx = prot.ordem.findIndex(a => a.id === id);
    const insertAt = Math.min(protIdx >= 0 ? protIdx : fullIds.length, fullIds.length);
    fullIds.splice(insertAt, 0, id);
  }
  return fullIds.map(id => authById(id)).filter(Boolean) as Authority[];
}

// ─────────────────────────────────────────────────────────────────────────────
// REGRA DE OURO DO ANFITRIÃO (PMTO)
// Base: Decreto 70.274/1972, Lei 2.578/2012 (PMTO), LC 128/2021 (LOB/PMTO)
// e Manual de Cerimonial Público da Presidência da República.
//
// 1. O Comandante-Geral tem status de Secretário de Estado e preside a solenidade.
// 2. O Governador, quando presente, é Anfitrião de Honra e passa a presidir.
// 3. Na ausência do Governador, o Vice-Governador assume como Anfitrião de Honra.
// 4. Quando há Anfitrião de Honra, o Comandante-Geral passa a Coanfitrião Executivo.
// 5. Secretários de Estado figuram como Coanfitriões Institucionais, não presidem.
// ─────────────────────────────────────────────────────────────────────────────
export function computarProtocolo(
  presentes: Authority[],
): ProtocolResult {
  const gov = presentes.find(a => a.id === 'governador') ?? null;
  const vice = presentes.find(a => a.id === 'vice') ?? null;
  const cmt = presentes.find(a => a.id === 'cmtgeral') ?? null;

  // Chefe do Executivo Estadual presente: Governador, ou Vice na ausência dele.
  const chefeExecutivo = gov ?? vice;

  const ordenado = [...presentes].sort((a, b) => a.prec - b.prec);

  let anfitriao: Authority | null = null;
  let papelAnfitriao = '';
  let coanfitriao: Authority | null = null;

  if (chefeExecutivo) {
    anfitriao = chefeExecutivo;
    papelAnfitriao = 'Anfitrião de Honra';
    if (cmt && cmt !== chefeExecutivo) coanfitriao = cmt;
  } else if (cmt) {
    anfitriao = cmt;
    papelAnfitriao = 'Anfitrião Principal';
  } else {
    anfitriao = ordenado[0] ?? null;
    papelAnfitriao = anfitriao ? 'Anfitrião (maior autoridade presente)' : '';
  }

  const ordem: Authority[] = [];
  if (anfitriao) ordem.push(anfitriao);
  if (coanfitriao && coanfitriao !== anfitriao) ordem.push(coanfitriao);
  for (const a of ordenado) {
    if (a !== anfitriao && a !== coanfitriao) ordem.push(a);
  }

  const papeis: Record<string, string> = {};
  ordem.forEach(a => {
    if (a === anfitriao) {
      papeis[a.id] = papelAnfitriao;
    } else if (a === coanfitriao) {
      papeis[a.id] = 'Coanfitrião Executivo';
    } else if (a.id === 'secseg' || a.id === 'secestado') {
      papeis[a.id] = 'Coanfitrião Institucional';
    } else {
      papeis[a.id] = 'Convidado de honra';
    }
  });

  return { ordem, anfitriao, coanfitriao, papelAnfitriao, papeis };
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPOSIÇÃO DAS CADEIRAS
// Ordem: centro geométrico → alternância direita/esquerda (direita = maior honra).
// Centro duplo quando nº de cadeiras é par.
// ─────────────────────────────────────────────────────────────────────────────
export function disporCadeiras(
  ordemHonra: Authority[],
  totalCadeiras: number,
  overrideIds?: string[] | null,
  authById?: (id: string) => Authority | undefined,
): SeatArrangement[] {
  if (overrideIds && overrideIds.length && authById) {
    return overrideIds.slice(0, totalCadeiras).map((id, fisica) => ({
      autoridade: id ? (authById(id) ?? null) : null,
      fisica,
    }));
  }

  const centro = Math.floor((totalCadeiras - 1) / 2);
  const duplo = totalCadeiras % 2 === 0;
  const seq: number[] = [];

  if (duplo) {
    const c1 = totalCadeiras / 2 - 1;
    const c2 = totalCadeiras / 2;
    seq.push(c1, c2);
    for (let d = 1; c1 - d >= 0 || c2 + d < totalCadeiras; d++) {
      if (c1 - d >= 0) seq.push(c1 - d);
      if (c2 + d < totalCadeiras) seq.push(c2 + d);
    }
  } else {
    seq.push(centro);
    for (let d = 1; d <= centro; d++) {
      if (centro - d >= 0) seq.push(centro - d);
      if (centro + d < totalCadeiras) seq.push(centro + d);
    }
  }

  const cadeiras: SeatArrangement[] = Array.from({ length: totalCadeiras }, (_, i) => ({
    autoridade: null,
    fisica: i,
  }));

  ordemHonra.slice(0, totalCadeiras).forEach((a, honra) => {
    const fis = seq[honra];
    if (fis !== undefined) cadeiras[fis] = { autoridade: a, fisica: fis };
  });

  return cadeiras;
}

export function ladoCadeira(fisica: number, total: number): 'centro' | 'direita' | 'esquerda' {
  const centro = Math.floor((total - 1) / 2);
  if (total % 2 === 1 && fisica === centro) return 'centro';
  if (fisica < total / 2) return 'direita';
  return 'esquerda';
}
