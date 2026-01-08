import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/shared/theme/colours';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { exerciseMuscleMap } from '@/shared/constants/muscle-mapping';

interface MuscleUsageChartProps {
  workoutLogs: Array<{
    date: string;
    performance: Array<{
      exerciseName: string;
      sets: Array<{ reps: string; intensity: string }>;
    }>;
  }> | undefined;
}

const normalizeExerciseName = (name: string): string => {
  let normalized = name.toLowerCase().trim();
  if (normalized.length > 3 && normalized.endsWith('es')) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.length > 2 && normalized.endsWith('s')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

export const MuscleUsageChart: React.FC<MuscleUsageChartProps> = ({ workoutLogs }) => {
  const customTemplates = useQuery(api.workouts.get_all_custom_workout_templates);
  const exerciseMuscleMappings = useQuery(api.workouts.get_exercise_muscle_mappings);

  const muscleUsage = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) {
      return {};
    }

    const usage: Record<string, number> = {};

    workoutLogs.forEach(log => {
      log.performance.forEach(perf => {
        const exerciseName = perf.exerciseName;
        const normalizedName = normalizeExerciseName(exerciseName);
        
        // Find muscles from custom exercises first
        let muscles: string[] = [];
        if (customTemplates) {
          const customExercise = customTemplates.find(
            ex => normalizeExerciseName(ex.exerciseName) === normalizedName
          );
          if (customExercise?.muscles) {
            muscles = customExercise.muscles;
          }
        }
        
        // If not found in custom, check standard exercise mappings from database
        if (muscles.length === 0 && exerciseMuscleMappings) {
          // Find exact match first
          if (exerciseMuscleMappings[exerciseName]) {
            muscles = exerciseMuscleMappings[exerciseName];
          } else {
            // Try normalized match
            const matchedKey = Object.keys(exerciseMuscleMappings).find(
              key => normalizeExerciseName(key) === normalizedName
            );
            if (matchedKey) {
              muscles = exerciseMuscleMappings[matchedKey];
            }
          }
        }
        
        // Fallback to old constant file if database doesn't have data yet
        if (muscles.length === 0) {
          const mappedExercise = exerciseMuscleMap.find(
            ex => normalizeExerciseName(ex.exercise) === normalizedName
          );
          if (mappedExercise) {
            muscles = mappedExercise.muscles;
          }
        }

        // Count sets for each muscle
        const setsCount = perf.sets.length;
        muscles.forEach(muscle => {
          if (!usage[muscle]) {
            usage[muscle] = 0;
          }
          usage[muscle] += setsCount;
        });
      });
    });

    return usage;
  }, [workoutLogs, customTemplates, exerciseMuscleMappings]);

  const sortedMuscles = useMemo(() => {
    return Object.entries(muscleUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 most used muscles
  }, [muscleUsage]);

  const maxUsage = useMemo(() => {
    return Math.max(...Object.values(muscleUsage), 1);
  }, [muscleUsage]);

  const formatMuscleName = (muscle: string): string => {
    return muscle
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Muscle Group Usage</Text>
      {sortedMuscles.length > 0 ? (
        <View style={styles.chartContainer}>
          {sortedMuscles.map(([muscle, sets]) => {
            const percentage = (sets / maxUsage) * 100;
            return (
              <View key={muscle} style={styles.row}>
                <Text style={styles.muscleLabel} numberOfLines={1}>
                  {formatMuscleName(muscle)}
                </Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.valueLabel}>{sets}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>No muscle data available</Text>
      )}
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
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  muscleLabel: {
    fontSize: 12,
    color: THEME.text,
    fontWeight: '500',
    minWidth: 100,
    maxWidth: 100,
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: THEME.background,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 10,
    minWidth: 4,
  },
  valueLabel: {
    fontSize: 12,
    color: THEME.subtleText,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: THEME.subtleText,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
