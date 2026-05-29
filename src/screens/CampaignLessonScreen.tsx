import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../components/ScreenShell';
import { OptionGrid } from '../components/OptionGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { CAMPAIGN_UNITS } from '../data/content';
import { calculateCampaignPoints } from '../domain/scoring';
import { usePlayer } from '../context/PlayerContext';
import { RootStackParamList } from '../navigation/types';
import { CampaignStep } from '../game/campaign/types';
import { goHome } from '../navigation/goHome';
import { useAndroidBack } from '../hooks/useAndroidBack';

type Props = NativeStackScreenProps<RootStackParamList, 'CampaignLesson'>;

function findLesson(lessonId: string) {
  for (const unit of CAMPAIGN_UNITS) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

export function CampaignLessonScreen({ navigation, route }: Props) {
  const { player, addPoints, updateCampaign } = usePlayer();
  const lesson = useMemo(
    () => findLesson(route.params.lessonId),
    [route.params.lessonId],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  useAndroidBack(() => {
    navigation.navigate('Campaign');
    return true;
  });

  if (!lesson) {
    return (
      <ScreenShell title="Ders bulunamadı" onBack={() => navigation.goBack()}>
        <PrimaryButton label="Geri" onPress={() => navigation.goBack()} />
      </ScreenShell>
    );
  }

  const step: CampaignStep = lesson.steps[stepIndex];
  const isInteractive =
    step.type === 'fill_blank' || step.type === 'translate';

  const finishLesson = async () => {
    const points = calculateCampaignPoints(lesson.xpReward, player.league);
    await addPoints(points);
    const completed = new Set(player.campaign.completedLessonIds);
    completed.add(lesson.id);
    await updateCampaign({
      completedLessonIds: Array.from(completed),
      currentLessonId: lesson.id,
      currentStepIndex: 0,
    });
    setDone(true);
  };

  if (done) {
    const points = calculateCampaignPoints(lesson.xpReward, player.league);
    return (
      <ScreenShell
        title="Ders tamam!"
        onBack={() => navigation.navigate('Campaign')}
        backLabel="← Ders listesi"
        onHome={() => goHome(navigation)}
      >
        <Text style={styles.reward}>+{points} puan kazandın</Text>
        <PrimaryButton
          label="Kampanyaya dön"
          onPress={() => navigation.navigate('Campaign')}
        />
        <PrimaryButton
          label="Ana menü — VS veya başka mod"
          variant="secondary"
          onPress={() => goHome(navigation)}
        />
      </ScreenShell>
    );
  }

  const handleContinue = () => {
    if (stepIndex + 1 >= lesson.steps.length) {
      finishLesson();
      return;
    }
    setStepIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <ScreenShell
      title={lesson.title}
      subtitle={`Adım ${stepIndex + 1} / ${lesson.steps.length}`}
      onBack={() => navigation.navigate('Campaign')}
      backLabel="← Ders listesi"
      onHome={() => goHome(navigation)}
    >
      <Text style={styles.prompt}>{step.promptEn}</Text>
      {step.promptTr ? <Text style={styles.promptTr}>{step.promptTr}</Text> : null}

      {isInteractive && step.options ? (
        <>
          <OptionGrid
            options={step.options}
            onSelect={(opt) => {
              if (revealed) return;
              setSelected(opt);
              setRevealed(true);
            }}
            selected={selected}
            correctAnswer={step.correctAnswer ?? ''}
            reveal={revealed}
            disabled={revealed}
          />
          {revealed ? (
            <PrimaryButton
              label={
                stepIndex + 1 >= lesson.steps.length
                  ? 'Dersi bitir'
                  : 'Devam'
              }
              onPress={handleContinue}
            />
          ) : null}
        </>
      ) : (
        <PrimaryButton label="Devam" onPress={handleContinue} />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  prompt: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '700',
  },
  promptTr: {
    color: '#94A3B8',
    fontSize: 17,
    lineHeight: 24,
  },
  reward: {
    color: '#22C55E',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
});
