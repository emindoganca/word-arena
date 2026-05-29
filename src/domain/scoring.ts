import { League, LEAGUE_INFO } from './league';

/** VS modunda kazananın attığı fark × lig çarpanı */
export function calculateVsPoints(margin: number, league: League): number {
  const safeMargin = Math.max(0, Math.floor(margin));
  const multiplier = LEAGUE_INFO[league].multiplier;
  return safeMargin * multiplier;
}

/** Kampanya görevleri için sabit ödül (lig çarpanı uygulanır) */
export function calculateCampaignPoints(
  baseReward: number,
  league: League,
): number {
  const multiplier = LEAGUE_INFO[league].multiplier;
  return Math.max(1, Math.floor(baseReward)) * multiplier;
}
