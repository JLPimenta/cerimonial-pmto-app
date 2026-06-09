export type EsferaKey =
  | 'estadual'
  | 'legislativo'
  | 'judiciario'
  | 'essencial'
  | 'federal'
  | 'municipal'
  | 'militar'
  | 'outro';

export type EsferaMeta = {
  label: string;
  tom: 'azul' | 'cinza';
};

export type Authority = {
  id: string;
  nome: string;
  cargo: string;
  orgao: string;
  esfera: EsferaKey;
  prec: number;
  ini: string;
  anfitriao?: boolean;
  custom?: boolean;
};

export type CeremonyType = {
  id: string;
  label: string;
  icon: string;
  custom?: boolean;
};

export type TipoLocal = 'aberto' | 'auditorio';

export type Ceremony = {
  id: string;
  tipo: string;
  nome: string;
  data: string;
  hora: string;
  local: string;
  cidade: string;
  tipoLocal: TipoLocal;
  mesaExpressa: boolean;
  totalCadeiras: number;
  presentIds: string[];
  override: string[] | null;
};

export type ProtocolResult = {
  ordem: Authority[];
  anfitriao: Authority | null;
  coanfitriao: Authority | null;
  papelAnfitriao: string;
  papeis: Record<string, string>;
};

export type SeatArrangement = {
  autoridade: Authority | null;
  fisica: number;
};

export type SpeechItem = {
  autoridade: Authority;
  momento: string;
  nota: string;
};
