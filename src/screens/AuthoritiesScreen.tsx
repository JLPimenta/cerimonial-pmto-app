import React, { useState, useReducer } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { Colors } from '../constants/colors';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';
import { Fab } from '../components/ui/Fab';
import { Sheet } from '../components/ui/Sheet';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Field, inputStyle } from '../components/ui/Field';
import { computarProtocolo } from '../domain/protocolRules';
import { ESFERA } from '../domain/catalog';
import { useCeremonies } from '../hooks/useCeremonies';
import { useCustomData } from '../hooks/useCustomData';
import type { EsferaKey } from '../domain/types';

type Props = NativeStackScreenProps<RootStackParams, 'Authorities'>;

export function AuthoritiesScreen({ route, navigation }: Props) {
  const { ceremonies, updateCeremony } = useCeremonies();
  const { allAuthorities, authById, addAuthority, removeAuthority } = useCustomData();

  const [sheet, setSheet] = useState(false);
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [busca, setBusca] = useState('');
  const [fCargo, setFCargo] = useState('');
  const [fEsfera, setFEsfera] = useState<EsferaKey>('estadual');
  const [confirmDel, setConfirmDel] = useState<any>(null);
  const [, force] = useReducer(x => x + 1, 0);

  const sol = ceremonies.find(c => c.id === route.params.id);
  if (!sol) return null;

  const presentes = sol.presentIds.map(id => authById(id)).filter(Boolean) as any[];
  const prot = computarProtocolo(presentes);

  const termoBusca = busca.trim().toLowerCase();
  const ausentes = allAuthorities()
    .filter(a => !sol.presentIds.includes(a.id))
    .filter(a => !termoBusca || a.nome.toLowerCase().includes(termoBusca) || ESFERA[a.esfera as EsferaKey]?.label.toLowerCase().includes(termoBusca));

  const add = (id: string) => updateCeremony({ ...sol, presentIds: [...sol.presentIds, id] });
  const rem = (id: string) => updateCeremony({ ...sol, presentIds: sol.presentIds.filter(x => x !== id) });

  const fecharSheet = () => { setSheet(false); setMode('list'); setBusca(''); };

  const salvarNova = () => {
    if (fCargo.trim().length < 2) return;
    addAuthority(fCargo, fEsfera);
    setFCargo(''); setFEsfera('estadual'); setMode('list'); force();
  };

  const excluirCustom = () => {
    const id = confirmDel.id;
    removeAuthority(id);
    setConfirmDel(null);
    if (sol.presentIds.includes(id)) updateCeremony({ ...sol, presentIds: sol.presentIds.filter(x => x !== id), override: null });
    else force();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        title="Autoridades presentes"
        subtitle={`${prot.ordem.length} confirmadas · ordenadas por precedência`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card pad={13} style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="info" size={19} color={Colors.azul} />
            <Text style={styles.infoText}>
              O app reordena automaticamente por precedência e aplica a <Text style={{ fontWeight: '700' }}>Regra de Ouro</Text>. O <Text style={{ fontWeight: '700' }}>carômetro</Text> de importação de pessoas entra numa próxima etapa.
            </Text>
          </View>
        </Card>

        <View style={{ gap: 9 }}>
          {prot.ordem.map((a, i) => {
            const ehAnf = a.id === prot.anfitriao?.id;
            const ehCo = a.id === prot.coanfitriao?.id;
            return (
              <Card key={a.id} pad={0} style={[styles.autCard, ehAnf ? { borderColor: Colors.ouro } : ehCo ? { borderColor: Colors.azulLin } : undefined]}>
                <View style={styles.autRow}>
                  <Text style={styles.autRank}>{i + 1}</Text>
                  <Avatar ini={a.ini} size={42} tom={ehAnf ? 'ouro' : a.esfera === 'militar' ? 'azul' : 'cinza'} ring={ehAnf ? Colors.ouro : ehCo ? Colors.azul : undefined} />
                  <View style={styles.autInfo}>
                    <Text style={styles.autNome}>{a.nome}</Text>
                    <Text style={styles.autOrgao} numberOfLines={1}>{a.custom ? 'Cadastro manual' : a.orgao}</Text>
                    {(ehAnf || ehCo || prot.papeis[a.id] === 'Coanfitrião Institucional') && (
                      <View style={{ marginTop: 5 }}>
                        <Badge tom={ehAnf ? 'ouro' : 'azul'}>{prot.papeis[a.id]}</Badge>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => rem(a.id)} style={styles.iconBtn}>
                    <Icon name="close" size={20} color={Colors.txt3} />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <Fab icon="person_add" label="Adicionar" onPress={() => { setMode('list'); setSheet(true); }} />

      <Sheet open={sheet} onClose={fecharSheet} title={mode === 'form' ? 'Cadastrar nova autoridade' : 'Adicionar autoridade'}>
        {mode === 'form' ? (
          <View style={styles.formContent}>
            <Field label="Cargo da autoridade" hint={`${fCargo.length}/150 caracteres`}>
              <TextInput
                value={fCargo}
                maxLength={150}
                autoFocus
                onChangeText={setFCargo}
                placeholder="Ex.: Reitor da Universidade Estadual"
                placeholderTextColor={Colors.txt3}
                style={inputStyle}
              />
            </Field>
            <Field label="Esfera de atuação">
              <View style={styles.esferaList}>
                {(Object.keys(ESFERA) as EsferaKey[]).map(k => (
                  <TouchableOpacity key={k} onPress={() => setFEsfera(k)} activeOpacity={0.8}
                    style={[styles.esferaBtn, fEsfera === k ? styles.esferaBtnActive : undefined]}>
                    <Text style={[styles.esferaBtnText, { color: fEsfera === k ? Colors.azul : Colors.txt2 }]}>
                      {ESFERA[k].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <View style={styles.formActions}>
              <View style={{ flex: 1 }}>
                <Button full variant="ghost" onPress={() => setMode('list')}>Cancelar</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button full variant="primary" icon="check" onPress={salvarNova} disabled={fCargo.trim().length < 2}>Salvar</Button>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.searchBox}>
              <Icon name="search" size={20} color={Colors.txt3} />
              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder="Filtrar por cargo ou esfera…"
                placeholderTextColor={Colors.txt3}
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity onPress={() => setMode('form')} style={styles.addBtn}>
              <View style={styles.addBtnIcon}>
                <Icon name="add" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.addBtnTitle}>Cadastrar nova autoridade</Text>
                <Text style={styles.addBtnSub}>Cargo não listado no catálogo</Text>
              </View>
            </TouchableOpacity>

            <View style={{ gap: 8 }}>
              {ausentes.length === 0 && (
                <Text style={styles.empty}>{termoBusca ? 'Nenhum cargo encontrado para esse filtro.' : 'Todas as autoridades já estão presentes.'}</Text>
              )}
              {ausentes.map((a: any) => (
                <View key={a.id} style={styles.ausenteItem}>
                  <TouchableOpacity onPress={() => add(a.id)} style={styles.ausenteContent}>
                    <Avatar ini={a.ini} size={40} tom={a.esfera === 'militar' ? 'azul' : 'cinza'} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.ausenteNome} numberOfLines={1}>{a.nome}</Text>
                        {a.custom && <Badge tom="cinza">manual</Badge>}
                      </View>
                      <Text style={styles.ausenteEsfera}>{ESFERA[a.esfera as EsferaKey]?.label}</Text>
                    </View>
                  </TouchableOpacity>
                  {a.custom && (
                    <TouchableOpacity onPress={() => setConfirmDel(a)} style={styles.iconBtnSm}>
                      <Icon name="delete" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => add(a.id)} style={styles.iconBtnSm}>
                    <Icon name="add_circle" size={24} color={Colors.azul} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </Sheet>

      <ConfirmModal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={excluirCustom}
        title="Excluir autoridade?"
        message={confirmDel ? `"${confirmDel.nome}" será removida do catálogo de cargos. Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 100, gap: 9 },
  infoCard: { backgroundColor: Colors.azulTint, borderColor: Colors.azulLin, marginBottom: 5 },
  infoRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 12.5, color: Colors.txt2, lineHeight: 18 },
  autCard: { overflow: 'hidden', borderWidth: 1, borderColor: Colors.borda },
  autRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11, paddingHorizontal: 13 },
  autRank: { width: 24, fontSize: 13, fontWeight: '800', color: Colors.txt3, textAlign: 'center' },
  autInfo: { flex: 1, minWidth: 0 },
  autNome: { fontSize: 14.5, fontWeight: '700', color: Colors.txt, lineHeight: 20 },
  autOrgao: { fontSize: 12, color: Colors.txt3, marginTop: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  formContent: { gap: 16 },
  esferaList: { gap: 8 },
  esferaBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: Colors.borda, backgroundColor: Colors.surface },
  esferaBtnActive: { borderColor: Colors.azul, backgroundColor: Colors.azulTint },
  esferaBtnText: { fontSize: 14, fontWeight: '600' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.bordaForte, borderRadius: 13, paddingHorizontal: 13, backgroundColor: Colors.surface, marginBottom: 12 },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: Colors.txt },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.azul, backgroundColor: Colors.azulTint, marginBottom: 12 },
  addBtnIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.azul, alignItems: 'center', justifyContent: 'center' },
  addBtnTitle: { fontSize: 14, fontWeight: '800', color: Colors.azul },
  addBtnSub: { fontSize: 11.5, color: Colors.txt2, marginTop: 1 },
  ausenteItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingHorizontal: 12, borderRadius: 13, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borda },
  ausenteContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  ausenteNome: { fontSize: 14, fontWeight: '700', color: Colors.txt, flex: 1 },
  ausenteEsfera: { fontSize: 11.5, color: Colors.txt3, marginTop: 1 },
  iconBtnSm: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: Colors.txt3, padding: 20, fontSize: 13 },
});
