export interface VsQuestion {
  id: string;
  sentenceParts: [string, string];
  correctWord: string;
  options: string[];
  hintTr?: string;
  cefr?: string;
  license?: 'CC0';
  source?: string;
}

export type RoundWinner = 'player' | 'opponent' | 'none';

export interface VsRoundResult {
  questionId: string;
  winner: RoundWinner;
}

export interface VsMatchState {
  roundIndex: number;
  totalRounds: number;
  playerScore: number;
  opponentScore: number;
  roundResults: VsRoundResult[];
  finished: boolean;
}

export const VS_ROUNDS_PER_MATCH = 9;
