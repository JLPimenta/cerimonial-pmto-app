import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { Colors } from '../constants/colors';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { SegBar } from '../components/ui/SegBar';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { TribunaPlanta } from '../components/tribuna/TribunaPlanta';
import { TribunaLista } from '../components/tribuna/TribunaLista';
import { computarProtocolo } from '../domain/protocolRules';
import { disporCadeiras } from '../domain/protocolRules';
import { termoTribuna } from '../domain/dateUtils';
import { useCeremonies } from '../hooks/useCeremonies';
import { useCustomData } from '../hooks/useCustomData';
import type { Authority } from '../domain/types';

type Props = NativeStackScreenProps<RootStackParams, 'Tribuna'>;

export function TribunaScreen({ route, navigation }: Props) {
  const { ceremonies, updateCeremony } = useCeremonies();
  const { authById } = useCustomData();
  const [view, setView] = useState<'planta' | 'lista'>('planta');

  const sol = ceremonies.find(c => c.id === route.params.id);
  if (!sol) return null;

  const presentes = sol.presentIds.map(id => authById(id)).filter(Boolean) as Authority[];
  const prot = computarProtocolo(presentes);
  const termo = termoTribuna(sol);

  const ordemHonra = sol.override
    ? sol.override.map(id => authById(id)).filter(Boolean) as Authority[]
    : prot.ordem;

  const cadeiras = disporCadeiras(ordemHonra, sol.totalCadeiras);

  const rankPorId: Record<string, number> = {};
  ordemHonra.forEach((a, i) => { rankPorId[a.id] = i + 1; });

  const mover = (i: number, dir: -1 | 1) => {
    const ids = ordemHonra.map(a => a.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    updateCeremony({ ...sol, override: ids });
  };

  const resetar = () => updateCeremony({ ...sol, override: null });

  return (
    <View style={styles.container}>
      <Header
        title={termo}
        subtitle={`${sol.totalCadeiras} cadeiras · centro ${sol.totalCadeiras % 2 ? 'único' : 'duplo'}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SegBar
          value={view}
          onChange={v => setView(v as 'planta' | 'lista')}
          options={[{ value: 'planta', label: 'Planta', icon: 'grid_view' }, { value: 'lista', label: 'Lista', icon: 'format_list_numbered' }]}
        />

        {sol.override && (
          <View style={styles.overrideBanner}>
            <Icon name="edit" size={18} color={Colors.ouroEsc} />
            <Text style={styles.overrideText}>Ajuste manual ativo — a disposição automática foi alterada.</Text>
            <Button size="sm" variant="ghost" icon="restart_alt" onPress={resetar}>Auto</Button>
          </View>
        )}

        <Card pad={16}>
          {view === 'planta' ? (
            <TribunaPlanta
              cadeiras={cadeiras}
              total={sol.totalCadeiras}
              protocolo={prot}
              rankPorId={rankPorId}
              layout="blocos"
            />
          ) : (
            <TribunaLista
              ordemHonra={ordemHonra}
              total={sol.totalCadeiras}
              protocolo={prot}
              onMover={mover}
              canEdit
            />
          )}
        </Card>

        {/* Legenda */}
        <Card pad={14}>
          <Text style={styles.legendaTitle}>Legenda</Text>
          <View style={{ gap: 9 }}>
            <LegendaItem cor={Colors.ouro} txt="Anfitrião — centro geométrico, preside o evento" />
            <LegendaItem cor={Colors.azul} txt="Coanfitrião / lado de maior honra (direita do anfitrião)" />
            <LegendaItem cor={Colors.bordaForte} txt="Cadeira livre ou autoridade de honra alternada" />
          </View>
          <Text style={styles.legendaNota}>
            Disposição por alternância centro → direita → esquerda, conforme Decreto 70.274/72 e o Manual de Cerimonial da Presidência.{view === 'lista' ? ' Use as setas para ajustar manualmente.' : ''}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

function LegendaItem({ cor, txt }: { cor: string; txt: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2.5, borderColor: cor }} />
      <Text style={{ fontSize: 12.5, color: Colors.txt2, lineHeight: 18, flex: 1 }}>{txt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 24, gap: 14 },
  overrideBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, paddingHorizontal: 13, borderRadius: 13, backgroundColor: Colors.ouroTint, borderWidth: 1, borderColor: Colors.ouro },
  overrideText: { flex: 1, fontSize: 12.5, color: Colors.txt2, fontWeight: '600' },
  legendaTitle: { fontSize: 12.5, fontWeight: '800', color: Colors.txt, marginBottom: 10 },
  legendaNota: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borda, fontSize: 11.5, color: Colors.txt3, lineHeight: 18 },
});
