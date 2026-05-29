import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../components/ScreenShell';
import { FillBlankSentence } from '../components/FillBlankSentence';
import { OptionGrid } from '../components/OptionGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { PLACEMENT_QUESTIONS } from '../data/content';
import { usePlayer } from '../context/PlayerContext';
import { RootStackParamList } from '../navigation/types';
import { leagueFromPlacementScore, LEAGUE_INFO } from '../domain/league';

type Props = NativeStackScreenProps<RootStackParamList, 'Placement'>;

export function PlacementScreen({ navigation }: Props) {
  const { completePlacement } = usePlayer();
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = PLACEMENT_QUESTIONS[index];
  const total = PLACEMENT_QUESTIONS.length;

  const assignedLeague = useMemo(
    () => leagueFromPlacementScore(correctCount, total),
    [correctCount, total],
  );

  const handleSelect = (option: string) => {
    if (revealed || finished) return;
    setSelected(option);
    setRevealed(true);
    if (option === question.correctWord) {
      setCorrectCount((c) => c + 1);
    }
  };

  const goNext = () => {
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const finalize = async () => {
    await completePlacement(correctCount, total);
    navigation.replace('Home');
  };

  if (finished) {
    const info = LEAGUE_INFO[assignedLeague];
    return (
      <ScreenShell title="Sınav tamamlandı" subtitle="Başlangıç ligin belirlendi.">
        <Text style={styles.result}>
          {correctCount}/{total} doğru
        </Text>
        <Text style={[styles.league, { color: info.color }]}>
          {info.labelTr} Lig — ×{info.multiplier} puan çarpanı
        </Text>
        <PrimaryButton label="Oyuna başla" onPress={finalize} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="Seviye sınavı"
      subtitle={`Soru ${index + 1} / ${total} — Eksik kelimeyi seç.`}
      onBack={() => navigation.goBack()}
    >
      <FillBlankSentence question={question} large />
      <OptionGrid
        options={question.options}
        onSelect={handleSelect}
        selected={selected}
        correctAnswer={question.correctWord}
        reveal={revealed}
        disabled={revealed}
      />
      {revealed ? (
        <PrimaryButton
          label={index + 1 >= total ? 'Sonucu gör' : 'Sonraki soru'}
          onPress={goNext}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  result: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
  },
  league: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});
