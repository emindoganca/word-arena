import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../components/ScreenShell';
import { CAMPAIGN_UNITS } from '../data/content';
import { usePlayer } from '../context/PlayerContext';
import { RootStackParamList } from '../navigation/types';
import { goHome } from '../navigation/goHome';
import { useAndroidBack } from '../hooks/useAndroidBack';

type Props = NativeStackScreenProps<RootStackParamList, 'Campaign'>;

export function CampaignScreen({ navigation }: Props) {
  const { player } = usePlayer();
  const completed = new Set(player.campaign.completedLessonIds);

  useAndroidBack(() => {
    goHome(navigation);
    return true;
  });

  return (
    <ScreenShell
      title="Kampanya"
      subtitle="Adım adım dersler — Duolingo tarzı ilerleme."
      onHome={() => goHome(navigation)}
    >
      {CAMPAIGN_UNITS.map((unit) => (
        <View key={unit.id} style={styles.unit}>
          <Text style={styles.unitTitle}>{unit.title}</Text>
          {unit.lessons.map((lesson) => {
            const done = completed.has(lesson.id);
            return (
              <Pressable
                key={lesson.id}
                style={[styles.lesson, done && styles.lessonDone]}
                onPress={() =>
                  navigation.navigate('CampaignLesson', { lessonId: lesson.id })
                }
              >
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDesc}>{lesson.description}</Text>
                <Text style={styles.lessonMeta}>
                  {done ? 'Tamamlandı ✓' : `${lesson.steps.length} adım · ${lesson.xpReward} XP taban`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  unit: {
    gap: 10,
    marginBottom: 20,
  },
  unitTitle: {
    color: '#A5B4FC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  lesson: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
  },
  lessonDone: {
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  lessonTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '600',
  },
  lessonDesc: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 14,
  },
  lessonMeta: {
    color: '#64748B',
    marginTop: 8,
    fontSize: 13,
  },
});
