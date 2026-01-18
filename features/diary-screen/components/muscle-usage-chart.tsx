'use client';

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useMemo } from 'react';
import { View, Text, Card } from '@/lib/ui/components';

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
        
        let muscles: string[] = [];
        if (customTemplates) {
          const customExercise = customTemplates.find(
            ex => ex.exercise?.exerciseName && normalizeExerciseName(ex.exercise.exerciseName) === normalizedName
          );
          if (customExercise?.exercise?.muscles) {
            muscles = customExercise.exercise.muscles;
          }
        }
        
        if (muscles.length === 0 && exerciseMuscleMappings) {
          if (exerciseMuscleMappings[exerciseName]) {
            muscles = exerciseMuscleMappings[exerciseName];
          } else {
            const matchedKey = Object.keys(exerciseMuscleMappings).find(
              key => normalizeExerciseName(key) === normalizedName
            );
            if (matchedKey) {
              muscles = exerciseMuscleMappings[matchedKey];
            }
          }
        }

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
      .slice(0, 10);
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
    <Card className="p-4 mb-4">
      <Text variant="h3" className="text-lg font-bold mb-4">
        Muscle Group Usage
      </Text>
      {sortedMuscles.length > 0 ? (
        <div className="space-y-3">
          {sortedMuscles.map(([muscle, sets]) => {
            const percentage = (sets / maxUsage) * 100;
            return (
              <div key={muscle} className="flex flex-row items-center gap-2">
                <Text className="text-xs text-text font-medium min-w-[100px] max-w-[100px] truncate">
                  {formatMuscleName(muscle)}
                </Text>
                <div className="flex-1 h-5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full min-w-[4px]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <Text className="text-xs text-subtle-text font-semibold min-w-[30px] text-right">
                  {sets}
                </Text>
              </div>
            );
          })}
        </div>
      ) : (
        <Text className="text-sm text-subtle-text text-center py-10">
          No muscle data available
        </Text>
      )}
    </Card>
  );
};
