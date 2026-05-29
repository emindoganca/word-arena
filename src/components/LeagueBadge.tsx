import { StyleSheet, Text, View } from 'react-native';
import { League, LEAGUE_INFO } from '../domain/league';

interface LeagueBadgeProps {
  league: League;
  points?: number;
}

export function LeagueBadge({ league, points }: LeagueBadgeProps) {
  const info = LEAGUE_INFO[league];

  return (
    <View style={[styles.badge, { borderColor: info.color }]}>
      <Text style={[styles.label, { color: info.color }]}>{info.labelTr} Lig</Text>
      <Text style={styles.mult}>×{info.multiplier} puan</Text>
      {points !== undefined ? (
        <Text style={styles.points}>{points.toLocaleString('tr-TR')} puan</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
  },
  mult: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  points: {
    color: '#F8FAFC',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
});
