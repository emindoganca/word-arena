import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../components/ScreenShell';
import { CONTENT_META } from '../data/content';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Credits'>;

export function CreditsScreen({ navigation }: Props) {
  return (
    <ScreenShell
      title="İçerik & lisanslar"
      subtitle="Yasal iş için tek ekran — uygulama yayında bunu göstermen yeterli."
      onBack={() => navigation.goBack()}
    >
      <View style={styles.block}>
        <Text style={styles.heading}>Cümleler</Text>
        <Text style={styles.body}>{CONTENT_META.license.sentences}</Text>
        <Text style={styles.body}>
          İngilizce cümleler Tatoeba CC0 dışa aktarımından üretilmiştir. CC0
          kapsamında ticari kullanım serbesttir; ayrıca sözleşme imzalamanız
          gerekmez.
        </Text>
        {CONTENT_META.note ? (
          <Text style={styles.note}>{CONTENT_META.note}</Text>
        ) : null}
      </View>

      <View style={styles.block}>
        <Text style={styles.heading}>Seviye etiketleri</Text>
        <Text style={styles.body}>{CONTENT_META.license.levels}</Text>
        <Text style={styles.body}>
          Kelime seviyeleri CEFR-J Vocabulary Profile (v1.5), Tono Laboratory,
          Tokyo University of Foreign Studies.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.heading}>Kaynaklar</Text>
        {CONTENT_META.sources.map((url) => (
          <Pressable key={url} onPress={() => Linking.openURL(url)}>
            <Text style={styles.link}>{url}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.meta}>
        Paket: {CONTENT_META.counts.vs} VS sorusu,{' '}
        {CONTENT_META.counts.placement} sınav sorusu,{' '}
        {CONTENT_META.counts.campaignUnits} kampanya ünitesi ·{' '}
        {new Date(CONTENT_META.generatedAt).toLocaleDateString('tr-TR')}
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  heading: {
    color: '#A5B4FC',
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    color: '#38BDF8',
    fontSize: 14,
    marginTop: 6,
  },
  meta: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 8,
  },
  note: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
