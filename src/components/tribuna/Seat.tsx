import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from '../ui/Icon';
import { ladoCadeira } from '../../domain/protocolRules';
import type { SeatArrangement } from '../../domain/types';

// Short label map — centralized so label changes don't touch screen logic
const SHORT_LABEL: Record<string, string> = {
  governador: 'Governador',
  vice: 'Vice-Gov.',
  presale: 'Pres. ALETO',
  prestj: 'Pres. TJTO',
  senador: 'Senador',
  depfed: 'Dep. Federal',
  pgj: 'PGJ • MPE',
  secseg: 'Sec. Segurança',
  secestado: 'Secretário',
  pge: 'PGE',
  dpge: 'Def. Geral DPE',
  mpf: 'MPF',
  dpu: 'DPU',
  desemb: 'Desembarg.',
  prefeito: 'Prefeito',
  depest: 'Dep. Estadual',
  cmtgeral: 'Comte-Geral',
  subcmt: 'Subcomte',
  cmtcbm: 'Comte CBMTO',
  oabto: 'OAB/TO',
  corpm: 'Cel. PM',
  vereador: 'Vereador',
  religioso: 'Aut. Religiosa',
  homenageado: 'Homenageado',
};

export function curtoLabel(id: string, nome: string): string {
  return SHORT_LABEL[id] ?? nome;
}

type Props = {
  seat: SeatArrangement;
  total: number;
  rank: number | null;
  anfId: string | null;
  coId: string | null;
  compact?: boolean;
  showNumbers?: boolean;
  onPress?: (seat: SeatArrangement) => void;
};

export function Seat({ seat, total, rank, anfId, coId, compact, showNumbers, onPress }: Props) {
  const a = seat.autoridade;
  const isAnf = a?.id === anfId;
  const isCo = a?.id === coId;
  const lado = ladoCadeira(seat.fisica, total);
  const empty = !a;
  const w = compact ? 64 : 94;

  const circleSize = compact ? 46 : 56;
  const circleBg = empty
    ? 'transparent'
    : isAnf ? Colors.ouroTint
    : isCo ? Colors.azulTint
    : '#EDEFF4';

  return (
    <TouchableOpacity
      onPress={() => onPress?.(seat)}
      disabled={!onPress}
      activeOpacity={0.8}
      style={{ width: w, alignItems: 'center', gap: 6 }}
    >
      {showNumbers && (
        <Text style={[styles.rank, { color: isAnf ? Colors.ouroEsc : Colors.txt3 }]}>
          {empty ? '—' : rank === 1 ? '1 • ANF.' : String(rank ?? '')}
        </Text>
      )}

      <View style={[
        styles.circle,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: circleBg,
          borderWidth: empty ? 2 : 0,
          borderStyle: empty ? 'dashed' : undefined,
          borderColor: empty ? Colors.bordaForte : undefined,
        },
        isAnf ? { shadowColor: Colors.ouro, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 0, borderWidth: 3, borderColor: Colors.ouro } : undefined,
        isCo ? { borderWidth: 2.5, borderColor: Colors.azul } : undefined,
      ]}>
        {empty
          ? <Icon name="event_seat" size={compact ? 20 : 24} color={Colors.bordaForte} />
          : <Text style={[styles.ini, { color: isAnf ? Colors.ouroEsc : isCo ? Colors.azul : Colors.txt2, fontSize: compact ? 15 : 18 }]}>{a!.ini}</Text>
        }
        {isAnf && (
          <View style={styles.starBadge}>
            <Icon name="star" size={16} color={Colors.ouro} />
          </View>
        )}
      </View>

      {!compact && (
        <Text style={[styles.shortLabel, { color: empty ? Colors.txt3 : Colors.txt }]} numberOfLines={2}>
          {empty ? 'Livre' : curtoLabel(a!.id, a!.nome)}
        </Text>
      )}
      {!compact && !empty && (
        <Text style={[styles.side, {
          color: lado === 'centro' ? Colors.ouroEsc : lado === 'direita' ? Colors.azul : Colors.txt3,
        }]}>
          {lado === 'centro' ? 'centro' : lado === 'direita' ? '› dir.' : 'esq. ‹'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rank: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ini: {
    fontWeight: '800',
  },
  starBadge: {
    position: 'absolute',
    top: -8,
    right: -6,
  },
  shortLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 26,
  },
  side: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
