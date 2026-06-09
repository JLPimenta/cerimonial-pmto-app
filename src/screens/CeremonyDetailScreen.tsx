import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { Colors } from '../constants/colors';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { computarProtocolo } from '../domain/protocolRules';
import { ordemPronunciamentos } from '../domain/speechOrder';
import { fmtData, termoTribuna, solNoPassado } from '../domain/dateUtils';
import { useCeremonies } from '../hooks/useCeremonies';
import { useCustomData } from '../hooks/useCustomData';

type Props = NativeStackScreenProps<RootStackParams, 'CeremonyDetail'>;

export function CeremonyDetailScreen({ route, navigation }: Props) {
  const { ceremonies, removeCeremony } = useCeremonies();
  const { authById, ceremonyTypeById } = useCustomData();
  const [confirmDel, setConfirmDel] = useState(false);

  const sol = ceremonies.find(c => c.id === route.params.id);
  if (!sol) return null;

  const ti = ceremonyTypeById(sol.tipo);
  const presentes = sol.presentIds.map(id => authById(id)).filter(Boolean) as any[];
  const prot = computarProtocolo(presentes);
  const termo = termoTribuna(sol);
  const fala = ordemPronunciamentos(prot);
  const govPresente = prot.anfitriao?.id === 'governador';
  const noPassado = solNoPassado(sol);

  const acao = (icon: string, title: string, sub: string, screen: keyof RootStackParams, tom: 'azul' | 'ouro') => (
    <Card onPress={() => navigation.navigate(screen as any, { id: sol.id })} pad={0} style={styles.acaoCard}>
      <View style={styles.acaoRow}>
        <View style={[styles.acaoIcon, { backgroundColor: tom === 'ouro' ? Colors.ouroTint : Colors.azulTint }]}>
          <Icon name={icon} size={23} color={tom === 'ouro' ? Colors.ouroEsc : Colors.azul} />
        </View>
        <View style={styles.acaoText}>
          <Text style={styles.acaoTitle}>{title}</Text>
          <Text style={styles.acaoSub}>{sub}</Text>
        </View>
        <Icon name="chevron_right" size={24} color={Colors.bordaForte} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title={ti.label}
        subtitle={`${fmtData(sol.data)} · ${sol.hora}`}
        onBack={() => navigation.goBack()}
        accent
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Card pad={17}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <Text style={[styles.heroNome, { flex: 1 }]}>{sol.nome}</Text>
            {!noPassado && (
              <TouchableOpacity onPress={() => navigation.navigate('NewCeremony', { id: sol.id })} style={{ padding: 4, marginRight: -4, marginTop: -4 }}>
                <Icon name="edit" size={22} color={Colors.azul} />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ gap: 9 }}>
            <Linha icon="location_on" txt={`${sol.local} · ${sol.cidade}`} />
            <Linha icon={sol.tipoLocal === 'auditorio' ? 'meeting_room' : 'park'} txt={sol.tipoLocal === 'auditorio' ? 'Auditório' : 'Local aberto / pátio'} />
            <Linha icon="event_seat" txt={`${termo} · ${sol.totalCadeiras} cadeiras`} />
          </View>
        </Card>

        {/* Regra de Ouro */}
        <Card pad={0} style={[styles.regraCard, { borderColor: govPresente ? Colors.ouro : Colors.azulLin }]}>
          <View style={[styles.regraHeader, { backgroundColor: govPresente ? Colors.ouroTint : Colors.azulTint }]}>
            <Icon name="verified" size={18} color={govPresente ? Colors.ouroEsc : Colors.azul} />
            <Text style={[styles.regraLabel, { color: govPresente ? Colors.ouroEsc : Colors.azul }]}>
              REGRA DE OURO DO ANFITRIÃO
            </Text>
          </View>
          <View style={styles.regraBody}>
            {prot.anfitriao ? (
              <View style={styles.anfRow}>
                <Avatar ini={prot.anfitriao.ini} size={46} tom="ouro" ring={Colors.ouro} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.anfPapel}>{prot.papelAnfitriao} · preside</Text>
                  <Text style={styles.anfNome}>{prot.anfitriao.nome}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.empty}>Adicione autoridades para definir o anfitrião.</Text>
            )}
            {prot.coanfitriao && (
              <View style={[styles.anfRow, styles.coRow]}>
                <Avatar ini={prot.coanfitriao.ini} size={40} tom="azul" ring={Colors.azul} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.coPapel}>COANFITRIÃO EXECUTIVO</Text>
                  <Text style={styles.coNome}>{prot.coanfitriao.nome}</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Ações */}
        <View style={{ gap: 10 }}>
          {acao('groups', 'Autoridades presentes', `${sol.presentIds.length} confirmadas · toque para gerir`, 'Authorities', 'azul')}
          {acao('chair', termo, sol.override ? 'Ajuste manual ativo' : 'Disposição automática das cadeiras', 'Tribuna', 'ouro')}
          {acao('format_list_numbered', 'Ordem de precedência', 'Lista protocolar completa', 'Precedence', 'azul')}
          {acao('ios_share', 'Exportar e compartilhar', 'PDF · imagem · roteiro', 'Export', 'azul')}
        </View>

        {/* Pronunciamentos */}
        {fala.length > 0 && (
          <Card pad={15}>
            <View style={styles.falaTitleRow}>
              <Icon name="mic" size={18} color={Colors.azul} />
              <Text style={styles.falaTitle}>Ordem dos pronunciamentos</Text>
            </View>
            <View style={{ gap: 10 }}>
              {fala.map((f, i) => (
                <View key={i} style={styles.falaItem}>
                  <Badge tom={i === fala.length - 1 ? 'ouro' : 'azul'}>{f.momento}</Badge>
                  <Text style={styles.falaNome}>{f.autoridade.nome}</Text>
                  <Text style={styles.falaNota}>{f.nota}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Excluir */}
        <View style={{ marginTop: 4 }}>
          <Button full variant="danger" icon="delete" onPress={() => !noPassado && setConfirmDel(true)} disabled={noPassado}>
            Excluir solenidade
          </Button>
          {noPassado && (
            <Text style={styles.noPassadoHint}>Solenidades já realizadas não podem ser excluídas.</Text>
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={() => { setConfirmDel(false); removeCeremony(sol.id); navigation.popToTop(); }}
        title="Excluir solenidade?"
        message={`"${sol.nome}" e toda a sua organização protocolar serão removidas. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />
    </View>
  );
}

function Linha({ icon, txt }: { icon: string; txt: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={19} color={Colors.txt3} />
      <Text style={{ fontSize: 14, color: Colors.txt2, fontWeight: '500', lineHeight: 20, flex: 1 }}>{txt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 24, gap: 14 },
  heroNome: { fontSize: 21, fontWeight: '600', color: Colors.txt, lineHeight: 26, marginBottom: 13 },
  regraCard: { overflow: 'hidden', borderWidth: 1 },
  regraHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11, paddingHorizontal: 15 },
  regraLabel: { fontSize: 12.5, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  regraBody: { padding: 13, paddingHorizontal: 15, gap: 11 },
  anfRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  coRow: { paddingTop: 11, borderTopWidth: 1, borderTopColor: Colors.borda, borderStyle: 'dashed' },
  anfPapel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase', color: Colors.ouroEsc },
  anfNome: { fontSize: 15, fontWeight: '800', color: Colors.txt, lineHeight: 20, marginTop: 1 },
  coPapel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase', color: Colors.azul },
  coNome: { fontSize: 14, fontWeight: '700', color: Colors.txt, marginTop: 1 },
  empty: { fontSize: 13, color: Colors.txt3 },
  acaoCard: { overflow: 'hidden' },
  acaoRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, paddingHorizontal: 15 },
  acaoIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  acaoText: { flex: 1 },
  acaoTitle: { fontSize: 15.5, fontWeight: '800', color: Colors.txt },
  acaoSub: { fontSize: 12.5, color: Colors.txt3, marginTop: 1 },
  falaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 11 },
  falaTitle: { fontSize: 13.5, fontWeight: '800', color: Colors.txt },
  falaItem: { flexDirection: 'column', gap: 6, padding: 11, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.borda },
  falaNome: { fontSize: 14, fontWeight: '700', color: Colors.txt, lineHeight: 19 },
  falaNota: { fontSize: 12, color: Colors.txt3, lineHeight: 17 },
  noPassadoHint: { fontSize: 12, color: Colors.txt3, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
