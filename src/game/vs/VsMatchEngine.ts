import {
  RoundWinner,
  VsMatchState,
  VsQuestion,
  VsRoundResult,
  VS_ROUNDS_PER_MATCH,
} from './types';

export function createVsMatch(): VsMatchState {
  return {
    roundIndex: 0,
    totalRounds: VS_ROUNDS_PER_MATCH,
    playerScore: 0,
    opponentScore: 0,
    roundResults: [],
    finished: false,
  };
}

function scoreRound(state: VsMatchState, winner: RoundWinner): VsMatchState {
  const playerScore =
    state.playerScore + (winner === 'player' ? 1 : 0);
  const opponentScore =
    state.opponentScore + (winner === 'opponent' ? 1 : 0);
  const roundIndex = state.roundIndex + 1;
  const finished = roundIndex >= state.totalRounds;

  return {
    ...state,
    playerScore,
    opponentScore,
    roundIndex,
    finished,
  };
}

/** İlk doğru cevabı veren turu kazanır; yanlış cevap turu bitirmez */
export function resolveRound(
  state: VsMatchState,
  question: VsQuestion,
  answer: string,
  answeredBy: 'player' | 'opponent',
): VsMatchState {
  if (state.finished) return state;

  const isCorrect = answer === question.correctWord;
  if (!isCorrect) {
    return state;
  }

  const winner: RoundWinner = answeredBy;
  const roundResult: VsRoundResult = {
    questionId: question.id,
    winner,
  };

  const next = scoreRound(state, winner);
  return {
    ...next,
    roundResults: [...state.roundResults, roundResult],
  };
}

export function getMatchWinner(
  state: VsMatchState,
): 'player' | 'opponent' | 'draw' | null {
  if (!state.finished) return null;
  if (state.playerScore > state.opponentScore) return 'player';
  if (state.opponentScore > state.playerScore) return 'opponent';
  return 'draw';
}

export function getScoreMargin(state: VsMatchState): number {
  return Math.abs(state.playerScore - state.opponentScore);
}
