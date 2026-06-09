import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';
import type { Authority, ProtocolResult } from '../../domain/types';

type Props = {
  ordemHonra: Authority[];
  total: number;
  protocolo: ProtocolResult;
  onMover?: (index: number, direction: -1 | 1) => void;
  canEdit?: boolean;
};

export function TribunaLista({ ordemHonra, total, protocolo, onMover, canEdit }: Props) {
  const anfId = protocolo.anfitriao?.id ?? null;
  const coId = protocolo.coanfitriao?.id ?? null;

  return (
    <View style={styles.container}>
      {ordemHonra.map((a, i) => {
        const rank = i + 1;
        const inTribuna = rank <= total;
        const isAnf = a.id === anfId;
        const isCo = a.id === coId;
        const papel = protocolo.papeis[a.id];

        return (
          <View key={a.id} style={[
            styles.row,
            { backgroundColor: inTribuna ? Colors.surface : '#F6F2E9' },
            isAnf ? styles.rowAnf : isCo ? styles.rowCo : undefined,
          ]}>
            <View style={[styles.rankBox, {
              backgroundColor: isAnf ? Colors.ouro : isCo ? Colors.azul : Colors.azulTint,
            }]}>
              <Text style={[styles.rankText, { color: isAnf || isCo ? '#fff' : Colors.azul }]}>
                {rank}
              </Text>
            </View>

            <Avatar
              ini={a.ini}
              size={38}
              tom={isAnf ? 'ouro' : isCo ? 'azul' : a.esfera === 'militar' ? 'azul' : 'cinza'}
              ring={isAnf ? Colors.ouro : undefined}
            />

            <View style={styles.info}>
              <Text style={styles.nome} numberOfLines={1}>{a.nome}</Text>
              <Text style={[styles.papel, {
                color: isAnf ? Colors.ouroEsc : isCo ? Colors.azul : Colors.txt3,
                fontWeight: isAnf || isCo ? '700' : '500',
              }]}>
                {inTribuna ? papel : 'Fora da tribuna · plateia preferencial'}
              </Text>
            </View>

            {canEdit && onMover && (
              <View style={styles.arrows}>
                <TouchableOpacity
                  onPress={() => onMover(i, -1)}
                  disabled={i === 0}
                  style={[styles.arrowBtn, i === 0 ? styles.arrowDisabled : undefined]}
                >
                  <Icon name="keyboard_arrow_up" size={20} color={i === 0 ? Colors.bordaForte : Colors.azul} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onMover(i, 1)}
                  disabled={i === ordemHonra.length - 1}
                  style={[styles.arrowBtn, i === ordemHonra.length - 1 ? styles.arrowDisabled : undefined]}
                >
                  <Icon name="keyboard_arrow_down" size={20} color={i === ordemHonra.length - 1 ? Colors.bordaForte : Colors.azul} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borda,
  },
  rowAnf: { borderColor: Colors.ouro },
  rowCo: { borderColor: Colors.azulLin },
  rankBox: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontWeight: '800', fontSize: 14 },
  info: { flex: 1, minWidth: 0 },
  nome: { fontSize: 14, fontWeight: '700', color: Colors.txt, lineHeight: 18 },
  papel: { fontSize: 11.5, marginTop: 1 },
  arrows: { gap: 2 },
  arrowBtn: {
    width: 30,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.borda,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: { backgroundColor: '#F2F4F8' },
});
