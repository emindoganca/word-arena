export enum League {
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Diamond = 'diamond',
}

export const LEAGUE_ORDER: League[] = [
  League.Bronze,
  League.Silver,
  League.Gold,
  League.Diamond,
];

export interface LeagueInfo {
  id: League;
  labelTr: string;
  labelEn: string;
  multiplier: number;
  color: string;
}

export const LEAGUE_INFO: Record<League, LeagueInfo> = {
  [League.Bronze]: {
    id: League.Bronze,
    labelTr: 'Bronz',
    labelEn: 'Bronze',
    multiplier: 1,
    color: '#CD7F32',
  },
  [League.Silver]: {
    id: League.Silver,
    labelTr: 'Gümüş',
    labelEn: 'Silver',
    multiplier: 5,
    color: '#9CA3AF',
  },
  [League.Gold]: {
    id: League.Gold,
    labelTr: 'Altın',
    labelEn: 'Gold',
    multiplier: 10,
    color: '#EAB308',
  },
  [League.Diamond]: {
    id: League.Diamond,
    labelTr: 'Elmas',
    labelEn: 'Diamond',
    multiplier: 100,
    color: '#38BDF8',
  },
};

export function leagueFromPlacementScore(
  correct: number,
  total: number,
): League {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 0.85) return League.Diamond;
  if (ratio >= 0.65) return League.Gold;
  if (ratio >= 0.45) return League.Silver;
  return League.Bronze;
}

export function clampLeague(league: League): League {
  if (!LEAGUE_ORDER.includes(league)) return League.Bronze;
  return league;
}

export function stepLeague(league: League, direction: 1 | -1): League {
  const index = LEAGUE_ORDER.indexOf(league);
  const next = Math.max(0, Math.min(LEAGUE_ORDER.length - 1, index + direction));
  return LEAGUE_ORDER[next];
}
