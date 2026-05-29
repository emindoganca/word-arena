import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { League, leagueFromPlacementScore } from '../domain/league';
import { recommendLeague } from '../domain/leagueRecommendation';
import { LeagueRecommendation, MatchSummary } from '../domain/leagueRecommendation';
import {
  loadPlayer,
  PlayerProfile,
  savePlayer,
  DEFAULT_PLAYER,
} from '../storage/playerStorage';

interface PlayerContextValue {
  player: PlayerProfile;
  loading: boolean;
  recommendation: LeagueRecommendation | null;
  refresh: () => Promise<void>;
  completePlacement: (correct: number, total: number) => Promise<void>;
  acceptLeagueRecommendation: () => Promise<void>;
  dismissRecommendation: () => void;
  addPoints: (points: number) => Promise<void>;
  recordMatch: (summary: MatchSummary) => Promise<void>;
  updateCampaign: (patch: Partial<PlayerProfile['campaign']>) => Promise<void>;
  setLeague: (league: League) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerProfile>(DEFAULT_PLAYER);
  const [loading, setLoading] = useState(true);
  const [dismissedRec, setDismissedRec] = useState(false);

  const persist = useCallback(async (next: PlayerProfile) => {
    setPlayer(next);
    await savePlayer(next);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadPlayer();
    setPlayer(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recommendation = useMemo(() => {
    if (dismissedRec || !player.placementCompleted) return null;
    return recommendLeague(
      player.league,
      player.placementCorrect,
      player.placementTotal,
      player.recentMatches,
    );
  }, [player, dismissedRec]);

  const completePlacement = useCallback(
    async (correct: number, total: number) => {
      const league = leagueFromPlacementScore(correct, total);
      await persist({
        ...player,
        placementCompleted: true,
        placementCorrect: correct,
        placementTotal: total,
        league,
      });
    },
    [player, persist],
  );

  const acceptLeagueRecommendation = useCallback(async () => {
    if (!recommendation) return;
    await persist({
      ...player,
      league: recommendation.suggestedLeague,
    });
    setDismissedRec(true);
  }, [player, persist, recommendation]);

  const addPoints = useCallback(
    async (points: number) => {
      await persist({
        ...player,
        totalPoints: player.totalPoints + points,
      });
    },
    [player, persist],
  );

  const recordMatch = useCallback(
    async (summary: MatchSummary) => {
      const recent = [summary, ...player.recentMatches].slice(0, 10);
      await persist({ ...player, recentMatches: recent });
      setDismissedRec(false);
    },
    [player, persist],
  );

  const updateCampaign = useCallback(
    async (patch: Partial<PlayerProfile['campaign']>) => {
      await persist({
        ...player,
        campaign: { ...player.campaign, ...patch },
      });
    },
    [player, persist],
  );

  const setLeague = useCallback(
    async (league: League) => {
      await persist({ ...player, league });
    },
    [player, persist],
  );

  const value: PlayerContextValue = {
    player,
    loading,
    recommendation,
    refresh,
    completePlacement,
    acceptLeagueRecommendation,
    dismissRecommendation: () => setDismissedRec(true),
    addPoints,
    recordMatch,
    updateCampaign,
    setLeague,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
