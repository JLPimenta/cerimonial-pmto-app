import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { Colors } from '../constants/colors';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { ESFERA } from '../domain/catalog';
import { computarProtocolo } from '../domain/protocolRules';
import { useCeremonies } from '../hooks/useCeremonies';
import { useCustomData } from '../hooks/useCustomData';
import type { Authority, EsferaKey } from '../domain/types';

type Props = NativeStackScreenProps<RootStackParams, 'Precedence'>;

export function PrecedenceScreen({ route, navigation }: Props) {
  const { ceremonies } = useCeremonies();
  const { authById } = useCustomData();

  const sol = ceremonies.find(c => c.id === route.params.id);
  if (!sol) return null;

  const presentes = sol.presentIds.map(id => authById(id)).filter(Boolean) as Authority[];
  const prot = computarProtocolo(presentes);

  return (
    <View style={styles.container}>
      <Header
        title="Ordem de precedência"
        subtitle={`${prot.ordem.length} autoridades · ordem protocolar`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {prot.ordem.map((a, i) => {
          const naTribuna = i < sol.totalCadeiras;
          return (
            <View key={a.id} style={[styles.row, i === 0 ? styles.rowFirst : undefined]}>
              <Text style={[styles.rank, { color: i === 0 ? Colors.ouroEsc : Colors.azul }]}>{i + 1}</Text>
              <Avatar ini={a.ini} size={40} tom={i === 0 ? 'ouro' : a.esfera === 'militar' ? 'azul' : 'cinza'} ring={i === 0 ? Colors.ouro : undefined} />
              <View style={styles.info}>
                <Text style={styles.nome}>{a.nome}</Text>
                <Text style={styles.esfera}>{ESFERA[a.esfera as EsferaKey]?.label}</Text>
              </View>
              <Badge tom={naTribuna ? 'azul' : 'cinza'}>{naTribuna ? 'cadeira' : 'plateia'}</Badge>
            </View>
          );
        })}

        <Card pad={14} style={styles.normaCard}>
          <Text style={styles.normaText}>
            <Text style={styles.negreto}>Base normativa: </Text>
            Decreto Federal nº 70.274/1972; Lei nº 2.578/2012 (PMTO); LC Estadual nº 128/2021 (LOB/PMTO). MP e Defensoria (estadual e federal) inseridos por serem posteriores a 1972, conforme o Manual de Cerimonial Público da Presidência da República.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 24, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borda,
  },
  rowFirst: { borderColor: Colors.ouro },
  rank: { width: 26, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  info: { flex: 1, minWidth: 0 },
  nome: { fontSize: 14, fontWeight: '700', color: Colors.txt, lineHeight: 18 },
  esfera: { fontSize: 11.5, color: Colors.txt3, marginTop: 2 },
  normaCard: { marginTop: 6, backgroundColor: '#fff' },
  normaText: { fontSize: 11.5, color: Colors.txt3, lineHeight: 18 },
  negreto: { color: Colors.txt2, fontWeight: '700' },
});
