import AsyncStorage from '@react-native-async-storage/async-storage';
import { League } from '../domain/league';
import { MatchSummary } from '../domain/leagueRecommendation';
import { CampaignProgress } from '../game/campaign/types';

const KEY = '@word_arena/player';

export interface PlayerProfile {
  displayName: string;
  league: League;
  totalPoints: number;
  placementCompleted: boolean;
  placementCorrect: number;
  placementTotal: number;
  recentMatches: MatchSummary[];
  campaign: CampaignProgress;
}

const DEFAULT_CAMPAIGN: CampaignProgress = {
  completedLessonIds: [],
  currentLessonId: 'u1-l1',
  currentStepIndex: 0,
};

export const DEFAULT_PLAYER: PlayerProfile = {
  displayName: 'Oyuncu',
  league: League.Bronze,
  totalPoints: 0,
  placementCompleted: false,
  placementCorrect: 0,
  placementTotal: 0,
  recentMatches: [],
  campaign: DEFAULT_CAMPAIGN,
};

export async function loadPlayer(): Promise<PlayerProfile> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { ...DEFAULT_PLAYER };
  try {
    return { ...DEFAULT_PLAYER, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PLAYER };
  }
}

export async function savePlayer(profile: PlayerProfile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

export async function resetPlayer(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
