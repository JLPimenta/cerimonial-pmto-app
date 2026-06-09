import type { Authority, EsferaKey, EsferaMeta } from './types';

export const ESFERA: Record<EsferaKey, EsferaMeta> = {
  estadual: { label: 'Executivo Estadual', tom: 'azul' },
  legislativo: { label: 'Legislativo', tom: 'cinza' },
  judiciario: { label: 'Judiciário', tom: 'cinza' },
  essencial: { label: 'Função Essencial à Justiça', tom: 'cinza' },
  federal: { label: 'Esfera Federal', tom: 'cinza' },
  municipal: { label: 'Municipal', tom: 'cinza' },
  militar: { label: 'Corporação / Militar', tom: 'azul' },
  outro: { label: 'Convidado', tom: 'cinza' },
};

// Base normativa de referência: Decreto Federal nº 70.274/1972,
// Lei nº 2.578/2012 (PMTO), LC Estadual nº 128/2021 (LOB/PMTO)
// e Manual de Cerimonial Público da Presidência da República.
// MP e Defensoria inseridos por serem posteriores a 1972.
export const CATALOGO: Authority[] = [
  { id: 'governador', nome: 'Governador do Estado', cargo: 'Chefe do Poder Executivo Estadual', orgao: 'Governo do Tocantins', esfera: 'estadual', prec: 1, ini: 'GV' },
  { id: 'vice', nome: 'Vice-Governador', cargo: 'Vice-Chefe do Executivo Estadual', orgao: 'Governo do Tocantins', esfera: 'estadual', prec: 2, ini: 'VG' },
  { id: 'presale', nome: 'Pres. da Assembleia Legislativa', cargo: 'Presidente do Poder Legislativo', orgao: 'ALETO', esfera: 'legislativo', prec: 3, ini: 'AL' },
  { id: 'prestj', nome: 'Pres. do Tribunal de Justiça', cargo: 'Presidente do Poder Judiciário TO', orgao: 'TJTO', esfera: 'judiciario', prec: 4, ini: 'TJ' },
  { id: 'senador', nome: 'Senador da República', cargo: 'Senador pelo Tocantins', orgao: 'Senado Federal', esfera: 'federal', prec: 5, ini: 'SN' },
  { id: 'depfed', nome: 'Deputado Federal', cargo: 'Deputado Federal pelo TO', orgao: 'Câmara dos Deputados', esfera: 'federal', prec: 6, ini: 'DF' },
  { id: 'pgj', nome: 'Procurador-Geral de Justiça', cargo: 'Chefe do Ministério Público Estadual', orgao: 'MPE/TO', esfera: 'essencial', prec: 7, ini: 'MP' },
  { id: 'secseg', nome: 'Sec. de Segurança Pública', cargo: 'Secretário de Estado', orgao: 'SSP/TO', esfera: 'estadual', prec: 8, ini: 'SS' },
  { id: 'secestado', nome: 'Secretário de Estado', cargo: 'Secretário de Estado (demais pastas)', orgao: 'Governo do Tocantins', esfera: 'estadual', prec: 9, ini: 'SE' },
  { id: 'pge', nome: 'Procurador-Geral do Estado', cargo: 'Chefe da Procuradoria do Estado', orgao: 'PGE/TO', esfera: 'essencial', prec: 10, ini: 'PG' },
  { id: 'dpge', nome: 'Defensor Público-Geral do Estado', cargo: 'Chefe da Defensoria Estadual', orgao: 'DPE/TO', esfera: 'essencial', prec: 11, ini: 'DE' },
  { id: 'mpf', nome: 'Procurador da República', cargo: 'Ministério Público Federal no TO', orgao: 'MPF/TO', esfera: 'federal', prec: 12, ini: 'PR' },
  { id: 'dpu', nome: 'Defensor Público Federal', cargo: 'Defensoria Pública da União no TO', orgao: 'DPU/TO', esfera: 'federal', prec: 13, ini: 'DU' },
  { id: 'desemb', nome: 'Desembargador(a)', cargo: 'Desembargador do TJTO', orgao: 'TJTO', esfera: 'judiciario', prec: 14, ini: 'DS' },
  { id: 'prefeito', nome: 'Prefeito de Palmas', cargo: 'Chefe do Executivo Municipal', orgao: 'Prefeitura de Palmas', esfera: 'municipal', prec: 15, ini: 'PF' },
  { id: 'depest', nome: 'Deputado Estadual', cargo: 'Deputado Estadual', orgao: 'ALETO', esfera: 'legislativo', prec: 16, ini: 'DE' },
  { id: 'cmtgeral', nome: 'Comandante-Geral da PMTO', cargo: 'Anfitrião — status de Secretário de Estado', orgao: 'PMTO', esfera: 'militar', prec: 9, ini: 'CG', anfitriao: true },
  { id: 'subcmt', nome: 'Subcomandante-Geral da PMTO', cargo: 'Subcomandante-Geral', orgao: 'PMTO', esfera: 'militar', prec: 17, ini: 'SC' },
  { id: 'cmtcbm', nome: 'Comandante-Geral do CBMTO', cargo: 'Comandante-Geral dos Bombeiros', orgao: 'CBMTO', esfera: 'militar', prec: 18, ini: 'CB' },
  { id: 'oabto', nome: 'Presidente da OAB/TO', cargo: 'Ordem dos Advogados — Seccional TO', orgao: 'OAB/TO', esfera: 'essencial', prec: 19, ini: 'OA' },
  { id: 'corpm', nome: 'Coronel PM (oficial superior)', cargo: 'Oficial Superior da PMTO', orgao: 'PMTO', esfera: 'militar', prec: 20, ini: 'CL' },
  { id: 'vereador', nome: 'Vereador de Palmas', cargo: 'Câmara Municipal de Palmas', orgao: 'CMP', esfera: 'municipal', prec: 21, ini: 'VR' },
  { id: 'religioso', nome: 'Autoridade Religiosa', cargo: 'Representação religiosa', orgao: '—', esfera: 'outro', prec: 22, ini: 'AR' },
  { id: 'homenageado', nome: 'Homenageado / Patrono', cargo: 'Personalidade homenageada na solenidade', orgao: '—', esfera: 'outro', prec: 23, ini: 'HP' },
];

// Precedência base por esfera para autoridades cadastradas manualmente
export const PREC_POR_ESFERA: Record<string, number> = {
  estadual: 9,
  legislativo: 16,
  judiciario: 14,
  essencial: 11,
  federal: 12,
  municipal: 15,
  militar: 20,
  outro: 23,
};

export function iniciaisDe(txt: string): string {
  const palavras = (txt || '').trim().split(/\s+/).filter(w => w.length > 2 || /^[A-ZÀ-Ý]/.test(w));
  const base = palavras.length ? palavras : (txt || '?').trim().split(/\s+/);
  return ((base[0] || '?')[0] + (base[1] ? base[1][0] : '')).toUpperCase() || '?';
}
