import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/shared/theme/colours';

interface MetricsWidgetProps {
  workoutLogs: Array<{
    date: string;
    performance: Array<{
      exerciseName: string;
      sets: Array<{ reps: string; intensity: string }>;
    }>;
  }> | undefined;
}

export const MetricsWidget: React.FC<MetricsWidgetProps> = ({ workoutLogs }) => {
  const metrics = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) {
      return {
        workoutsThisYear: 0,
        workoutsThisWeek: 0,
        currentStreak: 0,
      };
    }

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Count unique workout dates
    const workoutDates = new Set<string>();
    workoutLogs.forEach(log => {
      const logDate = new Date(log.date);
      workoutDates.add(logDate.toISOString().split('T')[0]);
    });

    // Count workouts this year
    const workoutsThisYear = Array.from(workoutDates).filter(dateStr => {
      const date = new Date(dateStr);
      return date >= startOfYear;
    }).length;

    // Count workouts this week
    const workoutsThisWeek = Array.from(workoutDates).filter(dateStr => {
      const date = new Date(dateStr);
      return date >= startOfWeek;
    }).length;

    // Calculate current streak (consecutive days with workouts)
    let currentStreak = 0;
    
    if (workoutDates.size > 0) {
      const sortedDates = Array.from(workoutDates)
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if most recent workout is today or yesterday
      const mostRecent = new Date(sortedDates[0]);
      mostRecent.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
      
      // If last workout was today or yesterday, check for consecutive days
      if (daysDiff <= 1) {
        // Count consecutive days starting from most recent
        let expectedDate = new Date(mostRecent);
        for (const dateStr of sortedDates) {
          const workoutDate = new Date(dateStr);
          workoutDate.setHours(0, 0, 0, 0);
          
          if (workoutDate.getTime() === expectedDate.getTime()) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else if (workoutDate < expectedDate) {
            // Gap found, streak is broken
            break;
          }
        }
      }
    }

    return {
      workoutsThisYear,
      workoutsThisWeek,
      currentStreak,
    };
  }, [workoutLogs]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Metrics</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.workoutsThisYear}</Text>
          <Text style={styles.metricLabel}>This Year</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.workoutsThisWeek}</Text>
          <Text style={styles.metricLabel}>This Week</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.currentStreak}</Text>
          <Text style={styles.metricLabel}>Day Streak</Text>
        </View>
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
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: THEME.subtleText,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});
