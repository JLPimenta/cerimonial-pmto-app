import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { Colors } from '../constants/colors';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { computarProtocolo } from '../domain/protocolRules';
import { ordemPronunciamentos } from '../domain/speechOrder';
import { fmtData, termoTribuna } from '../domain/dateUtils';
import { ESFERA } from '../domain/catalog';
import { useCeremonies } from '../hooks/useCeremonies';
import { useCustomData } from '../hooks/useCustomData';
import type { Authority, EsferaKey } from '../domain/types';

type Props = NativeStackScreenProps<RootStackParams, 'Export'>;

export function ExportScreen({ route, navigation }: Props) {
  const { ceremonies } = useCeremonies();
  const { authById, ceremonyTypeById } = useCustomData();
  const [toast, setToast] = useState<string | null>(null);

  const sol = ceremonies.find(c => c.id === route.params.id);
  if (!sol) return null;

  const ti = ceremonyTypeById(sol.tipo);
  const presentes = sol.presentIds.map(id => authById(id)).filter(Boolean) as Authority[];
  const prot = computarProtocolo(presentes);
  const fala = ordemPronunciamentos(prot);
  const termo = termoTribuna(sol);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const gerarPDF = async () => {
    try {
      const html = buildPdfHtml(sol, ti, prot, fala, termo);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar PDF' });
      } else {
        showToast('PDF gerado com sucesso.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  };

  const gerarRoteiro = async () => {
    try {
      const html = buildRoteiroHtml(sol, prot, fala, termo);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar Roteiro' });
      } else {
        showToast('Roteiro gerado com sucesso.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível gerar o roteiro.');
    }
  };

  const opt = (icon: string, title: string, sub: string, tom: 'azul' | 'ouro', onPress: () => void) => (
    <Card onPress={onPress} pad={0} style={{ overflow: 'hidden' }}>
      <View style={styles.optRow}>
        <View style={[styles.optIcon, { backgroundColor: tom === 'ouro' ? Colors.ouroTint : Colors.azulTint }]}>
          <Icon name={icon} size={23} color={tom === 'ouro' ? Colors.ouroEsc : Colors.azul} />
        </View>
        <View style={styles.optText}>
          <Text style={styles.optTitle}>{title}</Text>
          <Text style={styles.optSub}>{sub}</Text>
        </View>
        <Icon name="download" size={22} color={Colors.bordaForte} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Exportar e compartilhar" subtitle="Documentos oficiais da solenidade" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Preview */}
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <View style={styles.previewBar} />
          <View style={styles.preview}>
            <Text style={styles.previewOrg}>Polícia Militar do Tocantins · Cerimonial</Text>
            <Text style={styles.previewNome}>{sol.nome}</Text>
            <View style={styles.previewMeta}>
              <PreviewMeta icon="event" txt={`${fmtData(sol.data)} · ${sol.hora}`} />
              <PreviewMeta icon="location_on" txt={sol.cidade} />
              <PreviewMeta icon="event_seat" txt={`${termo} · ${sol.totalCadeiras} lug.`} />
            </View>
            <View style={styles.anfBox}>
              <Icon name="star" size={18} color={Colors.ouroEsc} />
              <Text style={styles.anfText}><Text style={{ fontWeight: '700' }}>{prot.papelAnfitriao}:</Text> {prot.anfitriao?.nome ?? '—'}</Text>
            </View>
          </View>
        </Card>

        <View style={{ gap: 10 }}>
          {opt('picture_as_pdf', 'Mapa da tribuna em PDF', 'Planta + lista de precedência, pronto para imprimir', 'ouro', gerarPDF)}
          {opt('description', 'Roteiro do mestre de cerimônias', 'Sequência, pronunciamentos e nominata', 'azul', gerarRoteiro)}
          {opt('share', 'Compartilhar resumo', 'Link/texto via WhatsApp, e-mail ou impressão', 'azul', () => showToast('Em breve'))}
        </View>

        <View style={styles.offlineNote}>
          <Icon name="wifi_off" size={15} color={Colors.txt3} />
          <Text style={styles.offlineText}>Funciona offline — gera localmente no dispositivo</Text>
        </View>
      </ScrollView>

      {toast && (
        <View style={styles.toast}>
          <Icon name="check_circle" size={20} color="#7FD0A3" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

function PreviewMeta({ icon, txt }: { icon: string; txt: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Icon name={icon} size={14} color={Colors.txt3} />
      <Text style={{ fontSize: 12, color: Colors.txt2 }}>{txt}</Text>
    </View>
  );
}

// ─── HTML Generators ─────────────────────────────────────────────────────────

function buildPdfHtml(sol: any, ti: any, prot: any, fala: any[], termo: string): string {
  const rows = prot.ordem.map((a: any, i: number) => `
    <tr style="background:${i === 0 ? '#F7EFDC' : i % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:8px 12px;font-weight:700;color:${i === 0 ? '#8A6314' : '#15407C'}">${i + 1}</td>
      <td style="padding:8px 12px;font-weight:600">${a.nome}</td>
      <td style="padding:8px 12px;color:#4A5366">${prot.papeis[a.id] ?? ''}</td>
      <td style="padding:8px 12px;color:#828B9C">${i < sol.totalCadeiras ? 'Tribuna' : 'Plateia'}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    body{font-family:Georgia,serif;margin:32px;color:#1B2230}
    h1{font-size:22px;margin:0 0 4px}
    .sub{font-size:13px;color:#4A5366;margin-bottom:20px}
    .bar{height:6px;background:linear-gradient(90deg,#15407C,#B8841C);border-radius:3px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-family:sans-serif;font-size:13px}
    th{text-align:left;padding:8px 12px;background:#EAF0F9;color:#15407C;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
  </style></head><body>
    <div class="bar"></div>
    <p style="font-size:11px;color:#828B9C;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Polícia Militar do Estado do Tocantins</p>
    <h1>${sol.nome}</h1>
    <p class="sub">${fmtData(sol.data)} · ${sol.hora} · ${sol.cidade} · ${termo} (${sol.totalCadeiras} cadeiras)</p>
    <p style="font-size:13px;margin:0 0 16px"><strong>${prot.papelAnfitrião}:</strong> ${prot.anfitriao?.nome ?? '—'}</p>
    <table><thead><tr><th>#</th><th>Autoridade</th><th>Papel</th><th>Posição</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
}

function buildRoteiroHtml(sol: any, prot: any, fala: any[], termo: string): string {
  const pronunciamentos = fala.map((f, i) => `
    <div style="margin-bottom:16px;padding:12px 16px;background:${i === fala.length - 1 ? '#F7EFDC' : '#EAF0F9'};border-radius:8px">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;color:${i === fala.length - 1 ? '#8A6314' : '#15407C'};margin:0 0 4px">${f.momento}</p>
      <p style="font-size:15px;font-weight:600;margin:0 0 2px">${f.autoridade.nome}</p>
      <p style="font-size:12px;color:#4A5366;margin:0">${f.nota}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    body{font-family:Georgia,serif;margin:32px;color:#1B2230}
    h1{font-size:20px}h2{font-size:16px;color:#15407C;border-bottom:2px solid #EAF0F9;padding-bottom:6px}
    .bar{height:6px;background:linear-gradient(90deg,#15407C,#B8841C);border-radius:3px;margin-bottom:16px}
  </style></head><body>
    <div class="bar"></div>
    <p style="font-size:11px;color:#828B9C;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Roteiro do Mestre de Cerimônias</p>
    <h1>${sol.nome}</h1>
    <p style="color:#4A5366;font-size:13px">${fmtData(sol.data)} · ${sol.hora} · ${sol.cidade}</p>
    <h2>Composição da ${termo}</h2>
    ${prot.ordem.slice(0, sol.totalCadeiras).map((a: any, i: number) => `<p style="margin:4px 0"><strong>${i + 1}.</strong> ${a.nome} — <em>${prot.papeis[a.id] ?? ''}</em></p>`).join('')}
    <h2>Ordem dos Pronunciamentos</h2>
    ${pronunciamentos}
  </body></html>`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 24, gap: 14 },
  previewBar: { height: 7, backgroundColor: Colors.azul },
  preview: { padding: 16, paddingHorizontal: 17 },
  previewOrg: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: Colors.txt3 },
  previewNome: { fontSize: 18, fontWeight: '600', color: Colors.txt, lineHeight: 24, marginVertical: 6 },
  previewMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, rowGap: 14, marginBottom: 12 },
  anfBox: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, paddingHorizontal: 12, backgroundColor: Colors.ouroTint, borderRadius: 12 },
  anfText: { fontSize: 12.5, color: Colors.txt2 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, paddingHorizontal: 15 },
  optIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  optText: { flex: 1 },
  optTitle: { fontSize: 15, fontWeight: '800', color: Colors.txt },
  optSub: { fontSize: 12.5, color: Colors.txt3, marginTop: 1 },
  offlineNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 4 },
  offlineText: { fontSize: 11.5, color: Colors.txt3 },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    padding: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.txt,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  toastText: { color: '#fff', fontSize: 13.5, fontWeight: '600', flex: 1 },
});
