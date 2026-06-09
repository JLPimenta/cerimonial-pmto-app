import React, { useState, useReducer } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { Colors } from '../constants/colors';
import { Header } from '../components/ui/Header';
import { Field, inputStyle } from '../components/ui/Field';
import { SegBar } from '../components/ui/SegBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Sheet } from '../components/ui/Sheet';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { hojeISO, agoraHM } from '../domain/dateUtils';
import { TIPOS_SOLENIDADE, ICONES_SOLENIDADE } from '../domain/ceremonyTypes';
import { useCeremonies } from '../hooks/useCeremonies';
import { useCustomData } from '../hooks/useCustomData';
import type { Ceremony } from '../domain/types';

type Props = NativeStackScreenProps<RootStackParams, 'NewCeremony'>;

export function NewCeremonyScreen({ navigation }: Props) {
  const { addCeremony } = useCeremonies();
  const { customCeremonyTypes, allCeremonyTypes, addCeremonyType, removeCeremonyType } = useCustomData();

  const [tipo, setTipo] = useState('formatura');
  const [nome, setNome] = useState('');
  const [data, setData] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [hora, setHora] = useState('09:00');
  const [local, setLocal] = useState('');
  const [cidade, setCidade] = useState('Palmas/TO');
  const [tipoLocal, setTipoLocal] = useState<'aberto' | 'auditorio'>('aberto');
  const [mesaExpressa, setMesaExpressa] = useState(false);
  const [cadeiras, setCadeiras] = useState(15);

  const [tipoSheet, setTipoSheet] = useState(false);
  const [tipoMode, setTipoMode] = useState<'list' | 'form'>('list');
  const [tBusca, setTBusca] = useState('');
  const [fTitulo, setFTitulo] = useState('');
  const [fIcone, setFIcone] = useState('');
  const [confirmDelTipo, setConfirmDelTipo] = useState<any>(null);
  const [, force] = useReducer(x => x + 1, 0);

  const hoje = hojeISO();
  const agora = agoraHM();
  const dataNoPassado = data < hoje;
  const horaNoPassado = data === hoje && hora < agora;
  const valido = nome.trim().length > 2 && local.trim().length > 1 && !dataNoPassado && !horaNoPassado;
  const termo = tipoLocal === 'auditorio' && mesaExpressa ? 'Mesa de Honra' : 'Tribuna de Honra';

  const customSel = customCeremonyTypes.find(t => t.id === tipo) ?? null;
  const tBuscaTrim = tBusca.trim().toLowerCase();
  const tiposCustomFiltered = customCeremonyTypes.filter(t =>
    !tBuscaTrim || t.label.toLowerCase().includes(tBuscaTrim)
  );

  const fecharTipoSheet = () => { setTipoSheet(false); setTipoMode('list'); setTBusca(''); };
  const escolherTipo = (id: string) => { setTipo(id); fecharTipoSheet(); };

  const salvarTipo = () => {
    if (fTitulo.trim().length < 2 || !fIcone) return;
    const novo = addCeremonyType(fTitulo, fIcone);
    setFTitulo(''); setFIcone(''); setTipoMode('list');
    setTipo(novo.id); fecharTipoSheet();
  };

  const excluirTipo = () => {
    const id = confirmDelTipo.id;
    removeCeremonyType(id);
    setConfirmDelTipo(null);
    if (tipo === id) setTipo('formatura');
    force();
  };

  const criar = () => {
    if (!valido) return;
    const ceremony: Ceremony = {
      id: 's' + Date.now(),
      tipo,
      nome: nome.trim(),
      data,
      hora,
      local: local.trim(),
      cidade,
      tipoLocal,
      mesaExpressa,
      totalCadeiras: cadeiras,
      presentIds: ['cmtgeral'],
      override: null,
    };
    addCeremony(ceremony);
    navigation.replace('CeremonyDetail', { id: ceremony.id });
    setTimeout(() => navigation.navigate('Authorities', { id: ceremony.id }), 100);
  };

  return (
    <View style={styles.container}>
      <Header title="Nova solenidade" subtitle="Passo único · poucos toques" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Field label="Tipo de solenidade">
          <View style={styles.tiposGrid}>
            {TIPOS_SOLENIDADE.map(t => {
              const on = t.id === tipo;
              return (
                <TouchableOpacity key={t.id} onPress={() => setTipo(t.id)} activeOpacity={0.8}
                  style={[styles.tipoBtn, on ? styles.tipoBtnActive : undefined]}>
                  <Icon name={t.icon} size={20} color={on ? Colors.azul : Colors.txt2} />
                  <Text style={[styles.tipoBtnText, { color: on ? Colors.azul : Colors.txt2, fontWeight: on ? '700' : '600' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity onPress={() => { setTipoMode('list'); setTipoSheet(true); }} activeOpacity={0.8}
              style={[styles.tipoBtn, customSel ? styles.tipoBtnActive : styles.tipoBtnDashed]}>
              <Icon name={customSel ? customSel.icon : 'add'} size={20} color={customSel ? Colors.azul : Colors.txt2} />
              <Text style={[styles.tipoBtnText, { color: customSel ? Colors.azul : Colors.txt2 }]} numberOfLines={1}>
                {customSel ? customSel.label : 'Outro tipo'}
              </Text>
            </TouchableOpacity>
          </View>
        </Field>

        <Field label="Nome da solenidade">
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Ex.: Formatura do CFSd 2026"
            placeholderTextColor={Colors.txt3}
            style={inputStyle}
          />
        </Field>

        <View style={styles.dateRow}>
          <View style={{ flex: 1.4 }}>
            <Field label="Data" hint={dataNoPassado ? '⚠ Selecione hoje ou uma data futura.' : undefined}>
              <TextInput
                value={data}
                onChangeText={setData}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={Colors.txt3}
                style={[inputStyle, { borderColor: dataNoPassado ? Colors.danger : Colors.bordaForte }]}
                keyboardType="numeric"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Hora" hint={!dataNoPassado && horaNoPassado ? '⚠ Horário já passou.' : undefined}>
              <TextInput
                value={hora}
                onChangeText={setHora}
                placeholder="HH:MM"
                placeholderTextColor={Colors.txt3}
                style={[inputStyle, { borderColor: !dataNoPassado && horaNoPassado ? Colors.danger : Colors.bordaForte }]}
                keyboardType="numeric"
              />
            </Field>
          </View>
        </View>

        <Field label="Local">
          <TextInput value={local} onChangeText={setLocal} placeholder="Ex.: Pátio do Comando-Geral" placeholderTextColor={Colors.txt3} style={inputStyle} />
        </Field>

        <Field label="Cidade / UF">
          <TextInput value={cidade} onChangeText={setCidade} style={inputStyle} />
        </Field>

        <Field label="Onde será realizada">
          <SegBar
            value={tipoLocal}
            onChange={v => setTipoLocal(v as 'aberto' | 'auditorio')}
            options={[{ value: 'aberto', label: 'Pátio / aberto', icon: 'park' }, { value: 'auditorio', label: 'Auditório', icon: 'meeting_room' }]}
          />
        </Field>

        {tipoLocal === 'auditorio' && (
          <Card pad={14} style={styles.mesaCard}>
            <TouchableOpacity onPress={() => setMesaExpressa(v => !v)} activeOpacity={0.8} style={styles.mesaRow}>
              <View style={[styles.toggle, { backgroundColor: mesaExpressa ? Colors.ouro : Colors.bordaForte }]}>
                <View style={[styles.toggleKnob, { transform: [{ translateX: mesaExpressa ? 19 : 0 }] }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mesaLabel}>Há previsão expressa de composição de mesa?</Text>
                <Text style={styles.mesaHint}>
                  Só nesse caso usa-se <Text style={{ fontWeight: '700' }}>"Mesa de Honra"</Text>. Caso contrário, o padrão é <Text style={{ fontWeight: '700' }}>"Tribuna de Honra"</Text> (contam-se cadeiras).
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        )}

        <Field label={`Nº de cadeiras na ${termo}`} hint="Lugares de honra a serem ocupados. Excedentes vão para a plateia preferencial.">
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => setCadeiras(c => Math.max(3, c - 2))} style={styles.stepBtn}>
              <Icon name="remove" size={22} color={Colors.azul} />
            </TouchableOpacity>
            <View style={styles.stepValue}>
              <Text style={styles.stepNumber}>{cadeiras}</Text>
              <Text style={styles.stepLabel}>cadeiras · centro {cadeiras % 2 ? 'único' : 'duplo'}</Text>
            </View>
            <TouchableOpacity onPress={() => setCadeiras(c => Math.min(21, c + 2))} style={styles.stepBtn}>
              <Icon name="add" size={22} color={Colors.azul} />
            </TouchableOpacity>
          </View>
        </Field>
      </ScrollView>

      <View style={styles.footer}>
        <Button full size="lg" variant="primary" icon="check_circle" onPress={criar} disabled={!valido}>
          Criar solenidade
        </Button>
      </View>

      {/* Sheet: Outro tipo de solenidade */}
      <Sheet open={tipoSheet} onClose={fecharTipoSheet} title={tipoMode === 'form' ? 'Cadastrar tipo de solenidade' : 'Outro tipo de solenidade'}>
        {tipoMode === 'form' ? (
          <View style={styles.formContent}>
            <Field label="Título da solenidade" hint={`${fTitulo.length}/100 caracteres`}>
              <TextInput
                value={fTitulo}
                maxLength={100}
                autoFocus
                onChangeText={setFTitulo}
                placeholder="Ex.: Inauguração de Quartel"
                placeholderTextColor={Colors.txt3}
                style={inputStyle}
              />
            </Field>
            <Field label="Ícone" hint="Selecione um ícone para identificar o tipo.">
              <View style={styles.iconsGrid}>
                {ICONES_SOLENIDADE.map(ic => {
                  const on = ic === fIcone;
                  return (
                    <TouchableOpacity key={ic} onPress={() => setFIcone(ic)} style={[styles.iconBtn, on ? styles.iconBtnActive : undefined]}>
                      <Icon name={ic} size={22} color={on ? Colors.azul : Colors.txt2} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Field>
            <View style={styles.formActions}>
              <Button full variant="ghost" onPress={() => setTipoMode('list')}>Cancelar</Button>
              <Button full variant="primary" icon="check" onPress={salvarTipo} disabled={fTitulo.trim().length < 2 || !fIcone}>Salvar</Button>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.searchBox}>
              <Icon name="search" size={20} color={Colors.txt3} />
              <TextInput
                value={tBusca}
                onChangeText={setTBusca}
                placeholder="Buscar por título da solenidade…"
                placeholderTextColor={Colors.txt3}
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity onPress={() => { setFTitulo(tBuscaTrim.length >= 2 ? tBusca.trim() : ''); setFIcone(''); setTipoMode('form'); }} style={styles.addBtn}>
              <View style={styles.addBtnIcon}>
                <Icon name="add" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.addBtnTitle}>Adicionar</Text>
                <Text style={styles.addBtnSub}>Cadastrar um novo tipo de solenidade</Text>
              </View>
            </TouchableOpacity>

            <View style={{ gap: 8 }}>
              {tiposCustomFiltered.length === 0 && (
                <Text style={styles.empty}>{tBuscaTrim ? 'Nenhum tipo encontrado.' : 'Nenhum tipo cadastrado manualmente ainda.'}</Text>
              )}
              {tiposCustomFiltered.map(t => {
                const on = t.id === tipo;
                return (
                  <View key={t.id} style={[styles.tipoItem, on ? { borderColor: Colors.azul } : undefined]}>
                    <TouchableOpacity onPress={() => escolherTipo(t.id)} style={styles.tipoItemContent}>
                      <View style={styles.tipoItemIcon}>
                        <Icon name={t.icon} size={21} color={Colors.azul} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tipoItemLabel} numberOfLines={1}>{t.label}</Text>
                        <Text style={styles.tipoItemSub}>Tipo cadastrado manualmente</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setConfirmDelTipo(t)} style={styles.tipoItemAction}>
                      <Icon name="delete" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => escolherTipo(t.id)} style={styles.tipoItemAction}>
                      <Icon name={on ? 'check_circle' : 'add_circle'} size={24} color={Colors.azul} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </Sheet>

      <ConfirmModal
        open={!!confirmDelTipo}
        onClose={() => setConfirmDelTipo(null)}
        onConfirm={excluirTipo}
        title="Excluir tipo?"
        message={confirmDelTipo ? `"${confirmDelTipo.label}" será removido. Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24, gap: 18 },
  footer: { flexShrink: 0, padding: 12, paddingHorizontal: 16, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.borda },
  tiposGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoBtn: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.borda,
    backgroundColor: Colors.surface,
  },
  tipoBtnActive: { borderColor: Colors.azul, backgroundColor: Colors.azulTint },
  tipoBtnDashed: { borderStyle: 'dashed' },
  tipoBtnText: { fontSize: 13, flex: 1 },
  dateRow: { flexDirection: 'row', gap: 12 },
  mesaCard: { backgroundColor: Colors.ouroTint, borderColor: Colors.ouro },
  mesaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  toggle: { width: 46, height: 27, borderRadius: 999, padding: 3, marginTop: 1 },
  toggleKnob: { width: 21, height: 21, borderRadius: 999, backgroundColor: '#fff' },
  mesaLabel: { fontSize: 13.5, fontWeight: '700', color: Colors.txt },
  mesaHint: { fontSize: 12, color: Colors.txt2, marginTop: 3, lineHeight: 18 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 8, paddingHorizontal: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.bordaForte, borderRadius: 13 },
  stepBtn: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, borderColor: Colors.bordaForte, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  stepValue: { flex: 1, alignItems: 'center' },
  stepNumber: { fontSize: 30, fontWeight: '800', color: Colors.azul, lineHeight: 34 },
  stepLabel: { fontSize: 11, color: Colors.txt3, marginTop: 2 },
  formContent: { gap: 16 },
  iconsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: { width: '14%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: Colors.borda, backgroundColor: Colors.surface },
  iconBtnActive: { borderColor: Colors.azul, backgroundColor: Colors.azulTint },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.bordaForte, borderRadius: 13, paddingHorizontal: 13, backgroundColor: Colors.surface, marginBottom: 12 },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: Colors.txt },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.azul, backgroundColor: Colors.azulTint, marginBottom: 12 },
  addBtnIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.azul, alignItems: 'center', justifyContent: 'center' },
  addBtnTitle: { fontSize: 14, fontWeight: '800', color: Colors.azul },
  addBtnSub: { fontSize: 11.5, color: Colors.txt2, marginTop: 1 },
  tipoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingHorizontal: 12, borderRadius: 13, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borda },
  tipoItemContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  tipoItemIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: Colors.azulTint, alignItems: 'center', justifyContent: 'center' },
  tipoItemLabel: { fontSize: 14, fontWeight: '700', color: Colors.txt },
  tipoItemSub: { fontSize: 11.5, color: Colors.txt3, marginTop: 1 },
  tipoItemAction: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: Colors.txt3, padding: 20, fontSize: 13 },
});
