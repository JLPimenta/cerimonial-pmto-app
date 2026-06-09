import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Seat, curtoLabel } from './Seat';
import type { SeatArrangement, ProtocolResult, Authority } from '../../domain/types';

export type TribunaLayout = 'linha' | 'arco' | 'blocos';

type Props = {
  cadeiras: SeatArrangement[];
  total: number;
  protocolo: ProtocolResult;
  rankPorId: Record<string, number>;
  layout?: TribunaLayout;
  seatStyle?: 'cartao' | 'compacto';
  showNumbers?: boolean;
  showPodium?: boolean;
  plateia?: Authority[];
};

export function TribunaPlanta({
  cadeiras,
  total,
  protocolo,
  rankPorId,
  layout = 'blocos',
  seatStyle = 'cartao',
  showNumbers = true,
  showPodium = true,
  plateia = [],
}: Props) {
  const anfId = protocolo.anfitriao?.id ?? null;
  const coId = protocolo.coanfitriao?.id ?? null;
  const compact = seatStyle === 'compacto';
  const centro = Math.floor((total - 1) / 2);

  if (layout === 'linha' || layout === 'arco') {
    return (
      <View>
        <View style={styles.hint}>
          <Icon name="swipe" size={15} color={Colors.txt3} />
          <Text style={styles.hintText}>deslize para ver toda a tribuna</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {cadeiras.map((c, i) => {
            const dist = Math.abs(c.fisica - centro);
            const dy = layout === 'arco' ? dist * dist * 1.4 : 0;
            return (
              <View key={i} style={{ transform: [{ translateY: dy }] }}>
                <Seat
                  seat={c}
                  total={total}
                  rank={c.autoridade ? rankPorId[c.autoridade.id] : null}
                  anfId={anfId}
                  coId={coId}
                  compact={compact}
                  showNumbers={showNumbers}
                />
              </View>
            );
          })}
        </ScrollView>
        {showPodium && (
          <View style={styles.podiumRow}>
            <View style={styles.podium}>
              <Icon name="podium" size={15} color={Colors.azul} />
              <Text style={styles.podiumText}>Púlpito</Text>
            </View>
          </View>
        )}
        <OrientacaoBar />
        <PlateiaSection plateia={plateia} rankPorId={rankPorId} />
      </View>
    );
  }

  // ─── BLOCOS ──────────────────────────────────────────────────────────────
  const anfCad = cadeiras.find(c => c.autoridade?.id === anfId) ?? cadeiras[centro];
  const dir = cadeiras
    .filter(c => c.fisica < total / 2 && c !== anfCad)
    .sort((a, b) => b.fisica - a.fisica);
  const esq = cadeiras
    .filter(c => c.fisica > centro && c !== anfCad)
    .sort((a, b) => a.fisica - b.fisica);

  return (
    <View>
      <View style={styles.centroBox}>
        <Badge tom="ouro" solid>Centro · Anfitrião</Badge>
        <Avatar ini={anfCad.autoridade?.ini ?? '·'} size={52} tom="ouro" ring={Colors.ouro} />
        <Text style={styles.centroLabel}>
          {anfCad.autoridade ? curtoLabel(anfCad.autoridade.id, anfCad.autoridade.nome) : 'Livre'}
        </Text>
      </View>

      <View style={styles.blocosGrid}>
        <View style={styles.blocosCol}>
          <View style={styles.colHeader}>
            <Text style={[styles.colTitle, { color: Colors.azul }]}>DIREITA DO ANFITRIÃO</Text>
            <Text style={styles.colSub}>maior honra • ímpares</Text>
          </View>
          {dir.map(c => <SeatRow key={c.fisica} seat={c} anfId={anfId} coId={coId} rankPorId={rankPorId} />)}
        </View>

        <View style={styles.blocosCol}>
          <View style={styles.colHeader}>
            <Text style={[styles.colTitle, { color: Colors.txt2 }]}>ESQUERDA DO ANFITRIÃO</Text>
            <Text style={styles.colSub}>honra alternada • pares</Text>
          </View>
          {esq.map(c => <SeatRow key={c.fisica} seat={c} anfId={anfId} coId={coId} rankPorId={rankPorId} />)}
        </View>
      </View>

      <OrientacaoBar />
      <PlateiaSection plateia={plateia} rankPorId={rankPorId} />
    </View>
  );
}

function SeatRow({ seat, anfId, coId, rankPorId }: {
  seat: SeatArrangement;
  anfId: string | null;
  coId: string | null;
  rankPorId: Record<string, number>;
}) {
  const a = seat.autoridade;
  return (
    <View style={styles.seatRow}>
      <Text style={styles.seatRank}>{a ? rankPorId[a.id] : '—'}</Text>
      <Avatar ini={a?.ini ?? '·'} size={30} tom={!a ? 'cinza' : a.id === coId ? 'azul' : 'cinza'} />
      <Text style={[styles.seatLabel, { color: a ? Colors.txt : Colors.txt3 }]} numberOfLines={2}>
        {a ? curtoLabel(a.id, a.nome) : 'Livre'}
      </Text>
    </View>
  );
}

function OrientacaoBar() {
  return (
    <View style={styles.orientacao}>
      <View style={styles.orientacaoLine} />
      <View style={styles.orientacaoCenter}>
        <Icon name="groups" size={16} color={Colors.txt3} />
        <Text style={styles.orientacaoText}>Plateia</Text>
      </View>
      <View style={styles.orientacaoLine} />
    </View>
  );
}

function PlateiaSection({ plateia, rankPorId }: { plateia: Authority[]; rankPorId: Record<string, number> }) {
  if (plateia.length === 0) return null;
  return (
    <View style={styles.plateiaBox}>
      <Text style={styles.plateiaTitle}>Plateia Preferencial ({plateia.length})</Text>
      <View style={styles.plateiaGrid}>
        {plateia.map(a => (
          <View key={a.id} style={styles.plateiaItem}>
            <Text style={styles.seatRank}>{rankPorId[a.id]}</Text>
            <Avatar ini={a.ini} size={28} tom="cinza" />
            <Text style={styles.plateiaLabel} numberOfLines={2}>{curtoLabel(a.id, a.nome)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 },
  hintText: { fontSize: 11, color: Colors.txt3 },
  scrollContent: { flexDirection: 'row', gap: 8, paddingVertical: 14, paddingHorizontal: 8 },
  podiumRow: { alignItems: 'center', marginTop: 6 },
  podium: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: Colors.azulTint },
  podiumText: { fontSize: 11, fontWeight: '700', color: Colors.azul, letterSpacing: 0.3, textTransform: 'uppercase' },
  orientacao: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  orientacaoLine: { flex: 1, height: 1, backgroundColor: Colors.borda },
  orientacaoCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orientacaoText: { fontSize: 11, fontWeight: '700', color: Colors.txt3, letterSpacing: 0.4, textTransform: 'uppercase' },
  centroBox: { alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 22, borderRadius: 18, backgroundColor: Colors.ouroTint, borderWidth: 1, borderColor: Colors.ouro, alignSelf: 'center', marginBottom: 12 },
  centroLabel: { fontSize: 13, fontWeight: '800', color: Colors.txt },
  blocosGrid: { flexDirection: 'row', gap: 12 },
  blocosCol: { flex: 1, gap: 6 },
  colHeader: { marginBottom: 8 },
  colTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  colSub: { fontSize: 10.5, color: Colors.txt3, marginTop: 1 },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borda },
  seatRank: { width: 18, textAlign: 'center', fontSize: 12, fontWeight: '800', color: Colors.txt3 },
  seatLabel: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 16 },
  plateiaBox: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.bordaForte,
    borderStyle: 'dashed',
    gap: 16,
  },
  plateiaTitle: { fontSize: 12, fontWeight: '800', color: Colors.txt, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, textAlign: 'center' },
  plateiaGrid: { gap: 8 },
  plateiaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borda },
  plateiaLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.txt2 },
});
