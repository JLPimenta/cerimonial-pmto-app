import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { Colors } from '../constants/colors';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { computarProtocolo, disporCadeiras, reconciliarOrdem } from '../domain/protocolRules';
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

  const resetarPasta = async () => {
    if (Platform.OS === 'android') {
      await AsyncStorage.removeItem('defaultDownloadDir');
      showToast('Pasta de salvamento redefinida. Baixe novamente para escolher.');
    }
  };

  const sol = ceremonies.find(c => c.id === route.params.id);
  if (!sol) return null;

  const ti = ceremonyTypeById(sol.tipo);
  const presentes = sol.presentIds.map(id => authById(id)).filter(Boolean) as Authority[];
  const prot = computarProtocolo(presentes);
  const fala = ordemPronunciamentos(prot);
  const termo = termoTribuna(sol);

  // Reconcile override with current presentIds
  const ordemHonra = reconciliarOrdem(sol, prot, authById);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const gerarPDF = async () => {
    try {
      const naTribuna = ordemHonra.slice(0, sol.totalCadeiras);
      const cadeiras = disporCadeiras(naTribuna, sol.totalCadeiras);
      const plateia = ordemHonra.slice(sol.totalCadeiras);
      const html = buildPdfHtml(sol, ti, prot, ordemHonra, cadeiras, plateia, termo);
      const { base64 } = await Print.printToFileAsync({ html, base64: true });
      if (!base64) throw new Error('Falha ao gerar base64');
      
      if (Platform.OS === 'android') {
        let directoryUri = await AsyncStorage.getItem('defaultDownloadDir');
        
        if (!directoryUri) {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            directoryUri = permissions.directoryUri;
            await AsyncStorage.setItem('defaultDownloadDir', directoryUri);
          } else {
            return; // Cancelled
          }
        }
        
        try {
          const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, `Mapa_Tribuna_${sol.id}.pdf`, 'application/pdf');
          await FileSystem.writeAsStringAsync(newFileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
          showToast('Salvo em seus arquivos (Documentos).');
          
          try {
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
              data: newFileUri,
              flags: 1,
              type: 'application/pdf'
            });
          } catch (launchErr) {
            console.log('Nenhum app de PDF encontrado', launchErr);
          }
        } catch (e) {
          // If permission was revoked or folder deleted, ask again
          await AsyncStorage.removeItem('defaultDownloadDir');
          Alert.alert('Aviso', 'A pasta de destino não está mais acessível. Tente novamente para selecionar uma nova pasta.');
        }
      } else {
        const fileUri = `${FileSystem.documentDirectory}Mapa_Tribuna_${sol.id}.pdf`;
        await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf', dialogTitle: 'Salvar PDF' });
        } else {
          showToast('PDF salvo.');
        }
      }
    } catch (e: any) {
      Alert.alert('Erro Detalhado', String(e?.stack || e?.message || e));
    }
  };

  const gerarRoteiro = async () => {
    try {
      const html = buildRoteiroHtml(sol, prot, ordemHonra, fala, termo);
      const { base64 } = await Print.printToFileAsync({ html, base64: true });
      if (!base64) throw new Error('Falha ao gerar base64');
      
      if (Platform.OS === 'android') {
        let directoryUri = await AsyncStorage.getItem('defaultDownloadDir');
        
        if (!directoryUri) {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            directoryUri = permissions.directoryUri;
            await AsyncStorage.setItem('defaultDownloadDir', directoryUri);
          } else {
            return; // Cancelled
          }
        }
        
        try {
          const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, `Roteiro_${sol.id}.pdf`, 'application/pdf');
          await FileSystem.writeAsStringAsync(newFileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
          showToast('Salvo em seus arquivos (Documentos).');
          
          try {
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
              data: newFileUri,
              flags: 1,
              type: 'application/pdf'
            });
          } catch (launchErr) {
            console.log('Nenhum app de PDF encontrado', launchErr);
          }
        } catch (e) {
          // If permission was revoked or folder deleted, ask again
          await AsyncStorage.removeItem('defaultDownloadDir');
          Alert.alert('Aviso', 'A pasta de destino não está mais acessível. Tente novamente para selecionar uma nova pasta.');
        }
      } else {
        const fileUri = `${FileSystem.documentDirectory}Roteiro_${sol.id}.pdf`;
        await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf', dialogTitle: 'Salvar Roteiro' });
        } else {
          showToast('Roteiro salvo.');
        }
      }
    } catch (e: any) {
      Alert.alert('Erro Detalhado', String(e?.stack || e?.message || e));
    }
  };

  const compartilharResumo = async () => {
    const msg = `*Solenidade: ${sol.nome}*\n` +
      `Data: ${fmtData(sol.data)} às ${sol.hora}\n` +
      `Local: ${sol.cidade}\n\n` +
      `*${termo}*\n` +
      ordemHonra.slice(0, sol.totalCadeiras).map((a: any, i: number) => `${i + 1}. ${a.nome}`).join('\n') +
      `\n\n*Pronunciamentos*\n` +
      fala.map((f: any, i: number) => `${f.momento}: ${f.autoridade.nome}`).join('\n');
      
    try {
      // Usar a API do React Native para texto
      const { Share } = require('react-native');
      await Share.share({ message: msg });
    } catch (e: any) {
      Alert.alert('Erro Detalhado', String(e?.stack || e?.message || e));
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
          {opt('share', 'Compartilhar resumo', 'Link/texto via WhatsApp, e-mail ou impressão', 'azul', compartilharResumo)}
        </View>

        <View style={styles.offlineNote}>
          <Icon name="wifi_off" size={15} color={Colors.txt3} />
          <Text style={styles.offlineText}>Funciona offline — gera localmente no dispositivo</Text>
        </View>

        {Platform.OS === 'android' && (
          <TouchableOpacity onPress={resetarPasta} style={{ alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontSize: 12, color: Colors.azul, fontWeight: '600' }}>Alterar pasta de salvamento</Text>
          </TouchableOpacity>
        )}
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

function buildPdfHtml(sol: any, ti: any, prot: any, ordemHonra: any[], cadeiras: any[], plateia: any[], termo: string): string {
  const rankPorId: Record<string, number> = {};
  ordemHonra.forEach((a: any, i: number) => { rankPorId[a.id] = i + 1; });

  const rows = ordemHonra.map((a: any, i: number) => `
    <tr style="background:${i === 0 ? '#F7EFDC' : i % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:8px 12px;font-weight:700;color:${i === 0 ? '#8A6314' : '#15407C'}">${i + 1}</td>
      <td style="padding:8px 12px;font-weight:600">${a.nome}</td>
      <td style="padding:8px 12px;color:#4A5366">${prot.papeis[a.id] ?? ''}</td>
      <td style="padding:8px 12px;color:#828B9C">${i < sol.totalCadeiras ? 'Tribuna' : 'Plateia'}</td>
    </tr>
  `).join('');

  const anfId = prot.anfitriao?.id;
  const coId = prot.coanfitriao?.id;

  const cadeirasHtml = cadeiras.map(c => {
    let cls = 'chair-convidado';
    if (!c.autoridade) cls = 'empty';
    else if (c.autoridade.id === anfId) cls = 'chair-anfitriao';
    else if (c.autoridade.id === coId) cls = 'chair-coanfitriao';
    
    return `
      <div class="chair ${cls}">
        ${c.autoridade ? rankPorId[c.autoridade.id] : ''}
      </div>
    `;
  }).join('');

  const plateiaHtml = plateia.length > 0 ? `
    <div class="diagram-container" style="margin-top: 40px; border-top: 2px dashed #cfd4db; padding-top: 30px;">
      <div class="plateia-title">PLATEIA PREFERENCIAL</div>
      <div class="chairs-row" style="margin-bottom:0">
        ${plateia.map(a => `
          <div class="chair chair-up">${rankPorId[a.id]}</div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    @page { margin: 20mm; }
    body{font-family:Georgia,serif;margin:0;color:#1B2230}
    h1{font-size:22px;margin:0 0 4px}
    .sub{font-size:13px;color:#4A5366;margin-bottom:20px}
    .bar{height:6px;background:linear-gradient(90deg,#15407C,#B8841C);border-radius:3px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-family:sans-serif;font-size:13px;margin-top:40px}
    th{text-align:left;padding:8px 12px;background:#EAF0F9;color:#15407C;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
    
    .diagram-container { margin: 30px 0; text-align: center; }
    .chairs-row { display: flex; justify-content: center; gap: 4px; margin-bottom: -2px; flex-wrap: nowrap; z-index: 2; position: relative; width: 100%; }
    .chair { flex: 0 1 34px; height: 32px; min-width: 16px; border: 2px solid #15407C; border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 13px; font-weight: 800; box-shadow: 0 -2px 4px rgba(0,0,0,0.06); overflow: hidden; }
    .chair-convidado { background: #fff; border-color: #15407C; color: #15407C; }
    .chair-anfitriao { background: #F7EFDC; border-color: #B8841C; color: #8A6314; }
    .chair-coanfitriao { background: #EAF0F9; border-color: #15407C; color: #15407C; }
    .chair-up { border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }
    .empty { background: #f0f2f5; border-color: #cfd4db; border-style: dashed; color: transparent; box-shadow: none; }
    .table-surface { background: #15407C; color: #fff; padding: 22px; border-radius: 4px; font-family: sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 5px; text-transform: uppercase; width: 100%; box-sizing: border-box; border-top: 6px solid #B8841C; box-shadow: 0 6px 12px rgba(21,64,124,0.25); z-index: 1; position: relative; }
    .plateia-title { font-family: sans-serif; font-size: 11px; font-weight: 800; color: #828B9C; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase; }
  </style></head><body>
    <div class="bar"></div>
    <p style="font-size:11px;color:#828B9C;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Polícia Militar do Estado do Tocantins</p>
    <h1>${sol.nome}</h1>
    <p class="sub">${fmtData(sol.data)} · ${sol.hora} · ${sol.cidade}</p>
    
    <div class="diagram-container">
      <div class="chairs-row">
        ${cadeirasHtml}
      </div>
      <div class="table-surface">${termo}</div>
    </div>
    ${plateiaHtml}

    <table><thead><tr><th>#</th><th>Autoridade</th><th>Papel</th><th>Posição</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
}

function buildRoteiroHtml(sol: any, prot: any, ordemHonra: any[], fala: any[], termo: string): string {
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
    ${ordemHonra.slice(0, sol.totalCadeiras).map((a: any, i: number) => `<p style="margin:4px 0"><strong>${i + 1}.</strong> ${a.nome} — <em>${prot.papeis[a.id] ?? ''}</em></p>`).join('')}
    <h2>Ordem dos Pronunciamentos</h2>
    ${pronunciamentos}
  </body></html>`;
}

const styles = {
  container: { flex: 1, backgroundColor: Colors.bg } as any,
  scroll: { flex: 1 } as any,
  content: { padding: 14, paddingBottom: 24, gap: 14 } as any,
  previewBar: { height: 7, backgroundColor: Colors.azul } as any,
  preview: { padding: 16, paddingHorizontal: 17 } as any,
  previewOrg: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: Colors.txt3 } as any,
  previewNome: { fontSize: 18, fontWeight: '600', color: Colors.txt, lineHeight: 24, marginVertical: 6 } as any,
  previewMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, rowGap: 14, marginBottom: 12 } as any,
  anfBox: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, paddingHorizontal: 12, backgroundColor: Colors.ouroTint, borderRadius: 12 } as any,
  anfText: { fontSize: 12.5, color: Colors.txt2 } as any,
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, paddingHorizontal: 15 } as any,
  optIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' } as any,
  optText: { flex: 1 } as any,
  optTitle: { fontSize: 15, fontWeight: '800', color: Colors.txt } as any,
  optSub: { fontSize: 12.5, color: Colors.txt3, marginTop: 1 } as any,
  offlineNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 4 } as any,
  offlineText: { fontSize: 11.5, color: Colors.txt3 } as any,
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
  } as any,
  toastText: { color: '#fff', fontSize: 13.5, fontWeight: '600', flex: 1 } as any,
};
