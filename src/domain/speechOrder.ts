import type { ProtocolResult, SpeechItem } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// ORDEM DE PRONUNCIAMENTOS
// Abertura: Comandante-Geral (discurso institucional da PMTO).
// Encerramento: maior autoridade presente (Governador, se presente).
// ─────────────────────────────────────────────────────────────────────────────
export function ordemPronunciamentos(protocolo: ProtocolResult): SpeechItem[] {
  const { ordem, anfitriao } = protocolo;
  const cmt = ordem.find(a => a.id === 'cmtgeral');
  const fala: SpeechItem[] = [];

  if (cmt) {
    fala.push({
      autoridade: cmt,
      momento: 'Abertura / Boas-vindas',
      nota: 'Discurso institucional da PMTO',
    });
  }

  const maior = anfitriao;
  if (maior && maior.id !== 'cmtgeral') {
    fala.push({
      autoridade: maior,
      momento: 'Encerramento',
      nota: 'Cabe à maior autoridade presente',
    });
  } else if (maior && maior.id === 'cmtgeral' && fala[0]) {
    fala[0] = {
      autoridade: cmt!,
      momento: 'Abertura e Encerramento',
      nota: 'Maior autoridade e anfitrião',
    };
  }

  return fala;
}
