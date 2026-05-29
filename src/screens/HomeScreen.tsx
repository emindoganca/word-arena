import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../components/ScreenShell';
import { PrimaryButton } from '../components/PrimaryButton';
import { LeagueBadge } from '../components/LeagueBadge';
import { usePlayer } from '../context/PlayerContext';
import { RootStackParamList } from '../navigation/types';
import { LEAGUE_INFO } from '../domain/league';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { player, loading, recommendation, acceptLeagueRecommendation, dismissRecommendation } =
    usePlayer();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!player.placementCompleted) {
    return (
      <ScreenShell
        title="Word Arena"
        subtitle="Tabletin için İngilizce öğrenme ve kapışma oyunu. Başlamak için kısa bir seviye sınavı yap."
      >
        <PrimaryButton
          label="Seviye Sınavına Başla"
          onPress={() => navigation.navigate('Placement')}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title={`Merhaba, ${player.displayName}!`}
      subtitle="Kampanyada öğren, VS modunda rakiplerle kapış."
    >
      <LeagueBadge league={player.league} points={player.totalPoints} />
      <Text style={styles.multNote}>
        {LEAGUE_INFO[player.league].labelTr} ligde kazandığın puanlar{' '}
        {LEAGUE_INFO[player.league].multiplier}x çarpanla kaydedilir.
      </Text>

      {recommendation ? (
        <View style={styles.recBox}>
          <Text style={styles.recTitle}>Lig önerisi</Text>
          <Text style={styles.recBody}>{recommendation.reason}</Text>
          <View style={styles.recActions}>
            <PrimaryButton
              label={`${LEAGUE_INFO[recommendation.suggestedLeague].labelTr} lige geç`}
              onPress={acceptLeagueRecommendation}
              style={styles.recBtn}
            />
            <PrimaryButton
              label="Şimdilik kal"
              variant="secondary"
              onPress={dismissRecommendation}
              style={styles.recBtn}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.menu}>
        <PrimaryButton
          label="Kampanya"
          onPress={() => navigation.navigate('Campaign')}
        />
        <PrimaryButton
          label="VS Kapışma"
          onPress={() => navigation.navigate('Vs')}
        />
        <PrimaryButton
          label="Ligler & Kurallar"
          variant="secondary"
          onPress={() => navigation.navigate('Leagues')}
        />
        <PrimaryButton
          label="İçerik & lisanslar"
          variant="secondary"
          onPress={() => navigation.navigate('Credits')}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  multNote: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
  },
  menu: {
    gap: 12,
    marginTop: 8,
  },
  recBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  recTitle: {
    color: '#A5B4FC',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  recBody: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
  },
  recActions: {
    marginTop: 12,
    gap: 8,
  },
  recBtn: {},
});
