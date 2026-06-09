import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { Colors } from '../constants/colors';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Fab } from '../components/ui/Fab';
import { Icon } from '../components/ui/Icon';
import { computarProtocolo } from '../domain/protocolRules';
import { fmtData } from '../domain/dateUtils';
import { useCeremonies } from '../hooks/useCeremonies';
import { useCustomData } from '../hooks/useCustomData';

type Props = NativeStackScreenProps<RootStackParams, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { ceremonies } = useCeremonies();
  const { ceremonyTypeById } = useCustomData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Brand header */}
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Icon name="gavel" size={22} color="#fff" />
          <View style={styles.brandGold} />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brandTitle}>Cerimonial PMTO</Text>
          <Text style={styles.brandSub}>Protocolo & Tribuna de Honra</Text>
        </View>
        <View style={styles.menuBtn}>
          <Icon name="menu_book" size={20} color={Colors.txt2} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Próximas solenidades</Text>
          <Text style={styles.listCount}>{ceremonies.length} agendadas</Text>
        </View>

        {ceremonies.map(s => {
          const ti = ceremonyTypeById(s.tipo);
          const prot = computarProtocolo(
            s.presentIds.map(id => ({ id } as any)).filter(Boolean)
          );
          return (
            <CeremonyCard
              key={s.id}
              sol={s}
              ti={ti}
              prot={prot}
              onPress={() => navigation.navigate('CeremonyDetail', { id: s.id })}
            />
          );
        })}
      </ScrollView>

      <Fab icon="add" label="Nova solenidade" onPress={() => navigation.navigate('NewCeremony')} />
    </SafeAreaView>
  );
}

function CeremonyCard({ sol, ti, prot, onPress }: any) {
  return (
    <Card onPress={onPress} pad={0} style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.typeIcon}>
            <Icon name={ti.icon} size={19} color={Colors.azul} />
          </View>
          <Badge tom="azul">{ti.label}</Badge>
          <View style={{ flex: 1 }} />
          <Icon name="chevron_right" size={22} color={Colors.bordaForte} />
        </View>
        <Text style={styles.cardTitle}>{sol.nome}</Text>
        <View style={styles.metaRow}>
          <Meta icon="event" txt={`${fmtData(sol.data)} · ${sol.hora}`} />
          <Meta icon="location_on" txt={sol.cidade} />
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.avatarStack}>
          {prot.ordem.slice(0, 4).map((a: any, i: number) => (
            <View key={a.id} style={[styles.avatarWrap, { marginLeft: i ? -10 : 0 }]}>
              <Avatar ini={a.ini} size={26} tom={i === 0 ? 'ouro' : 'azul'} />
            </View>
          ))}
        </View>
        <Text style={styles.authCount}>{sol.presentIds.length} autoridades</Text>
        <View style={{ flex: 1 }} />
        <Badge tom={prot.anfitriao?.id === 'governador' ? 'ouro' : 'cinza'}>
          {prot.anfitriao ? prot.papelAnfitriao.split(' ').pop() : '—'}
        </Badge>
      </View>
    </Card>
  );
}

function Meta({ icon, txt }: { icon: string; txt: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={16} color={Colors.txt3} />
      <Text style={styles.metaTxt}>{txt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borda, padding: 18, paddingBottom: 16 },
  brandIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.azul, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  brandGold: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, backgroundColor: Colors.ouro },
  brandText: { flex: 1 },
  brandTitle: { fontWeight: '700', fontSize: 19, color: Colors.txt },
  brandSub: { fontSize: 12, color: Colors.txt3, marginTop: 2 },
  menuBtn: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, borderColor: Colors.borda, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 100, gap: 12 },
  listHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 },
  listTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.txt },
  listCount: { fontSize: 12.5, color: Colors.txt3, fontWeight: '600' },
  card: { overflow: 'hidden' },
  cardBody: { padding: 15, paddingBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  typeIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.azulTint, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '600', fontSize: 17.5, color: Colors.txt, lineHeight: 22, marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, rowGap: 16 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, paddingHorizontal: 15, backgroundColor: Colors.bg, borderTopWidth: 1, borderTopColor: Colors.borda },
  avatarStack: { flexDirection: 'row' },
  avatarWrap: { borderRadius: 13, borderWidth: 2, borderColor: Colors.bg },
  authCount: { fontSize: 12, color: Colors.txt2, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { fontSize: 12.5, color: Colors.txt2 },
});
