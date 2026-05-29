import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../components/ScreenShell';
import { FillBlankSentence } from '../components/FillBlankSentence';
import { OptionGrid } from '../components/OptionGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { pickVsMatchQuestions } from '../data/content';
import {
  createVsMatch,
  getMatchWinner,
  getScoreMargin,
  resolveRound,
} from '../game/vs/VsMatchEngine';
import { VS_ROUNDS_PER_MATCH, VsMatchState, VsQuestion } from '../game/vs/types';
import { calculateVsPoints } from '../domain/scoring';
import { usePlayer } from '../context/PlayerContext';
import { RootStackParamList } from '../navigation/types';
import { goHome } from '../navigation/goHome';

type Props = NativeStackScreenProps<RootStackParamList, 'Vs'>;

export function VsScreen({ navigation }: Props) {
  const { player, addPoints, recordMatch } = usePlayer();
  const questions = useMemo(
    () => pickVsMatchQuestions(VS_ROUNDS_PER_MATCH),
    [],
  );
  const [match, setMatch] = useState<VsMatchState>(() => createVsMatch());
  const [roundLocked, setRoundLocked] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const botTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion: VsQuestion | undefined = questions[match.roundIndex];
  const winner = getMatchWinner(match);
  const finished = match.finished;

  const clearBotTimer = useCallback(() => {
    if (botTimer.current) {
      clearTimeout(botTimer.current);
      botTimer.current = null;
    }
  }, []);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearBotTimer();
      clearAdvanceTimer();
    },
    [clearAdvanceTimer, clearBotTimer],
  );

  const startNextRoundUi = useCallback(() => {
    setSelected(null);
    setReveal(false);
    setRoundLocked(false);
  }, []);

  const finishRound = useCallback(
    (answeredBy: 'player' | 'opponent', answer: string, question: VsQuestion) => {
      if (answer !== question.correctWord) {
        return false;
      }

      setRoundLocked(true);
      setReveal(true);

      setMatch((prev) => {
        const next = resolveRound(prev, question, answer, answeredBy);
        advanceTimer.current = setTimeout(() => {
          startNextRoundUi();
        }, 1100);
        return next;
      });
      return true;
    },
    [startNextRoundUi],
  );

  const scheduleBot = useCallback(
    (question: VsQuestion) => {
      clearBotTimer();
      if (roundLocked || finished) return;

      const delay = 900 + Math.random() * 1600;
      botTimer.current = setTimeout(() => {
        const roll = Math.random();
        const answer =
          roll < 0.55
            ? question.correctWord
            : question.options[
                Math.floor(Math.random() * question.options.length)
              ];
        const resolved = finishRound('opponent', answer, question);
        if (!resolved) {
          scheduleBot(question);
        }
      }, delay);
    },
    [clearBotTimer, finishRound, finished, roundLocked],
  );

  useEffect(() => {
    if (!finished && currentQuestion && !roundLocked) {
      scheduleBot(currentQuestion);
    }
    return clearBotTimer;
  }, [
    clearBotTimer,
    currentQuestion,
    finished,
    match.roundIndex,
    roundLocked,
    scheduleBot,
  ]);

  const handlePlayerAnswer = (option: string) => {
    if (roundLocked || finished || !currentQuestion) return;
    clearBotTimer();
    setSelected(option);

    if (option !== currentQuestion.correctWord) {
      setReveal(true);
      return;
    }

    finishRound('player', option, currentQuestion);
  };

  const handleMatchEnd = async () => {
    const result = getMatchWinner(match);
    const margin = getScoreMargin(match);
    const won = result === 'player';
    const points = won ? calculateVsPoints(margin, player.league) : 0;

    if (won && points > 0) {
      await addPoints(points);
    }
    await recordMatch({
      won,
      margin: won ? margin : -margin,
      questionsTotal: VS_ROUNDS_PER_MATCH,
    });
    navigation.goBack();
  };

  if (finished && winner) {
    const margin = getScoreMargin(match);
    const won = winner === 'player';
    const points = won ? calculateVsPoints(margin, player.league) : 0;

    return (
      <ScreenShell
        title={won ? 'Kazandın!' : winner === 'draw' ? 'Berabere' : 'Kaybettin'}
        subtitle={`Skor: ${match.playerScore} - ${match.opponentScore}`}
        onHome={() => handleMatchEnd()}
      >
        {won ? (
          <Text style={styles.winPoints}>
            +{points} puan (fark {margin} × lig çarpanı)
          </Text>
        ) : (
          <Text style={styles.loss}>Bir sonraki maçta şans!</Text>
        )}
        <PrimaryButton label="Ana menüye dön" onPress={handleMatchEnd} />
      </ScreenShell>
    );
  }

  if (!currentQuestion) {
    return (
      <ScreenShell title="VS" onBack={() => navigation.goBack()}>
        <PrimaryButton label="Geri" onPress={() => navigation.goBack()} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="VS Kapışma"
      subtitle={`Tur ${match.roundIndex + 1}/${VS_ROUNDS_PER_MATCH} — İlk doğru cevap turu alır`}
      onBack={() => {
        clearBotTimer();
        clearAdvanceTimer();
        goHome(navigation);
      }}
      backLabel="← Çık"
      onHome={() => {
        clearBotTimer();
        clearAdvanceTimer();
        goHome(navigation);
      }}
    >
      <View style={styles.scoreRow}>
        <Text style={styles.scoreYou}>Sen: {match.playerScore}</Text>
        <Text style={styles.scoreBot}>Rakip: {match.opponentScore}</Text>
      </View>
      <FillBlankSentence question={currentQuestion} large />
      <OptionGrid
        options={currentQuestion.options}
        onSelect={handlePlayerAnswer}
        selected={selected}
        correctAnswer={currentQuestion.correctWord}
        reveal={reveal}
        disabled={roundLocked}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreYou: {
    color: '#A5B4FC',
    fontSize: 18,
    fontWeight: '700',
  },
  scoreBot: {
    color: '#F87171',
    fontSize: 18,
    fontWeight: '700',
  },
  winPoints: {
    color: '#22C55E',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  loss: {
    color: '#94A3B8',
    fontSize: 17,
    marginBottom: 12,
  },
});
