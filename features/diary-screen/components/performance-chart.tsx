import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/shared/theme/colours';

interface PerformanceChartProps {
  workoutLogs: Array<{
    date: string;
    performance: Array<{
      exerciseName: string;
      sets: Array<{ reps: string; intensity: string }>;
    }>;
  }> | undefined;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ workoutLogs }) => {
  const performanceData = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) {
      return {
        weeklyVolume: [] as Array<{ week: string; volume: number }>,
        maxVolume: 0,
      };
    }

    // Group workouts by week
    const weeklyData: Record<string, number> = {};
    
    workoutLogs.forEach(log => {
      const date = new Date(log.date);
      const weekStart = new Date(date);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      // Calculate total volume (reps) for this workout
      let workoutVolume = 0;
      log.performance.forEach(perf => {
        perf.sets.forEach(set => {
          workoutVolume += parseInt(set.reps, 10) || 0;
        });
      });
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey] += workoutVolume;
    });

    // Convert to array and sort by date (most recent first)
    const weeklyArray = Object.entries(weeklyData)
      .map(([week, volume]) => ({
        week,
        volume,
      }))
      .sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime())
      .slice(0, 12); // Last 12 weeks

    const maxVolume = Math.max(...weeklyArray.map(w => w.volume), 1);

    return {
      weeklyVolume: weeklyArray.reverse(), // Reverse to show oldest to newest
      maxVolume,
    };
  }, [workoutLogs]);

  const formatWeekLabel = (weekDateStr: string): string => {
    const date = new Date(weekDateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Volume</Text>
      <View style={styles.chartContainer}>
        {performanceData.weeklyVolume.length > 0 ? (
          <View style={styles.barsContainer}>
            {performanceData.weeklyVolume.map((week, index) => {
              const heightPercent = (week.volume / performanceData.maxVolume) * 100;
              return (
                <View key={week.week} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${Math.max(heightPercent, 5)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {formatWeekLabel(week.week)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No performance data yet</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 16,
  },
  chartContainer: {
    minHeight: 150,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 150,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  barContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  bar: {
    width: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: THEME.subtleText,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: THEME.subtleText,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
