import { League, leagueFromPlacementScore, stepLeague } from './league';

export interface MatchSummary {
  won: boolean;
  margin: number;
  questionsTotal: number;
}

export interface LeagueRecommendation {
  suggestedLeague: League;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
}

const MIN_MATCHES_FOR_RECOMMENDATION = 3;

/**
 * İlk maçlardan sonra performansa göre lig önerisi.
 * Sandbagging'i önlemek için yalnızca tutarlı üst/alt performansta öneri verir.
 */
export function recommendLeague(
  currentLeague: League,
  placementCorrect: number,
  placementTotal: number,
  recentMatches: MatchSummary[],
): LeagueRecommendation | null {
  if (recentMatches.length < MIN_MATCHES_FOR_RECOMMENDATION) {
    return null;
  }

  const placementLeague = leagueFromPlacementScore(
    placementCorrect,
    placementTotal,
  );
  const wins = recentMatches.filter((m) => m.won).length;
  const winRate = wins / recentMatches.length;
  const avgMargin =
    recentMatches.reduce((sum, m) => sum + (m.won ? m.margin : -m.margin), 0) /
    recentMatches.length;

  if (winRate >= 0.75 && avgMargin >= 2) {
    const up = stepLeague(currentLeague, 1);
    if (up !== currentLeague) {
      return {
        suggestedLeague: up,
        reason:
          'Son maçlarda yüksek kazanma oranı ve fark var. Bir üst ligde daha adil rekabet edersin.',
        confidence: winRate >= 0.85 ? 'high' : 'medium',
      };
    }
  }

  if (winRate <= 0.25 && avgMargin <= -2) {
    const down = stepLeague(currentLeague, -1);
    if (down !== currentLeague) {
      return {
        suggestedLeague: down,
        reason:
          'Son maçlarda zorlanıyorsun. Bir alt ligde öğrenmeye odaklanmak daha verimli olabilir.',
        confidence: winRate <= 0.15 ? 'high' : 'medium',
      };
    }
  }

  if (
    currentLeague !== placementLeague &&
    winRate >= 0.55 &&
    winRate <= 0.65
  ) {
    return {
      suggestedLeague: placementLeague,
      reason:
        'Giriş sınavı seviyen ile güncel performansın uyumlu görünüyor.',
      confidence: 'low',
    };
  }

  return null;
}
