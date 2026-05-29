import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../components/ScreenShell';
import { LEAGUE_ORDER, LEAGUE_INFO } from '../domain/league';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Leagues'>;

export function LeaguesScreen({ navigation }: Props) {
  return (
    <ScreenShell
      title="Lig sistemi"
      subtitle="Düşük ligde kasılmak puan kazandırmaz — çarpanlar adil rekabet için tasarlandı."
      onBack={() => navigation.goBack()}
    >
      {LEAGUE_ORDER.map((league) => {
        const info = LEAGUE_INFO[league];
        return (
          <View key={league} style={[styles.card, { borderLeftColor: info.color }]}>
            <Text style={[styles.name, { color: info.color }]}>{info.labelTr}</Text>
            <Text style={styles.desc}>
              VS ve kampanya puanları {info.multiplier}x çarpanla hesaplanır.
            </Text>
            <Text style={styles.example}>
              Örnek: 4 farkla kazan → {4 * info.multiplier} puan
            </Text>
          </View>
        );
      })}
      <View style={styles.note}>
        <Text style={styles.noteTitle}>Lig önerisi</Text>
        <Text style={styles.noteBody}>
          Giriş sınavından sonra ligin belirlenir. En az 3 VS maçından sonra
          performansına göre daha uygun bir lig önerebiliriz — istersen kabul
          edersin.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  desc: {
    color: '#CBD5E1',
    marginTop: 6,
    fontSize: 15,
  },
  example: {
    color: '#64748B',
    marginTop: 8,
    fontSize: 14,
  },
  note: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#172554',
    borderRadius: 12,
  },
  noteTitle: {
    color: '#93C5FD',
    fontWeight: '700',
    marginBottom: 8,
  },
  noteBody: {
    color: '#E2E8F0',
    lineHeight: 22,
    fontSize: 15,
  },
});
