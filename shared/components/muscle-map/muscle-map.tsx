'use client';

import { api } from '@/convex/_generated/api';
import { View } from '@/lib/ui/components';
import { THEME } from '@/shared/theme/colours';
import { generateHexShades } from '@/shared/utils/colors';
import { useQuery } from 'convex/react';
import { useMemo } from 'react';
import Body, { Muscle } from 'react-body-highlighter';

interface MuscleMapProps {
  performedExercises: string[];
}

/**
 * Normalizes exercise names for matching (handles case-insensitive and pluralization)
 */
const normalizeExerciseName = (name: string): string => {
  let normalized = name.toLowerCase().trim();
  if (normalized.length > 3 && normalized.endsWith('es')) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.length > 2 && normalized.endsWith('s')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

/**
 * Finds muscles for an exercise by trying multiple matching strategies:
 * 1. Exact match
 * 2. Case-insensitive match
 * 3. Normalized match (handles plurals)
 */
const findMusclesForExercise = (
  exerciseName: string,
  exerciseMuscleMappings: Record<string, string[]> | undefined
): string[] => {
  if (!exerciseMuscleMappings) {
    return [];
  }

  // Try exact match first
  if (exerciseMuscleMappings[exerciseName]) {
    return exerciseMuscleMappings[exerciseName];
  }

  // Try case-insensitive match
  const caseInsensitiveMatch = Object.keys(exerciseMuscleMappings).find(
    key => key.toLowerCase() === exerciseName.toLowerCase()
  );
  if (caseInsensitiveMatch) {
    return exerciseMuscleMappings[caseInsensitiveMatch];
  }

  // Try normalized match (handles plurals and variations)
  const normalizedName = normalizeExerciseName(exerciseName);
  const normalizedMatch = Object.keys(exerciseMuscleMappings).find(
    key => normalizeExerciseName(key) === normalizedName
  );
  if (normalizedMatch) {
    return exerciseMuscleMappings[normalizedMatch];
  }

  return [];
};

export const MuscleMap = ({ performedExercises }: MuscleMapProps) => {
  
  const exerciseMuscleMappings = useQuery(api.workouts.get_exercise_muscle_mappings);
  const colorPalette = generateHexShades(THEME.error, 6, 20);
  
  // Transform exercises into IExerciseData format for react-body-highlighter
  const exerciseData = useMemo(() => {
    return performedExercises.map(performedExercise => {
      // Find muscles using multiple matching strategies
      const muscles = findMusclesForExercise(performedExercise, exerciseMuscleMappings);

      return {
        name: performedExercise,
        muscles: muscles as  Muscle[], // Cast to Muscle type since react-body-highlighter uses specific union type
      };
    }).filter(ex => ex.muscles.length > 0);
  }, [performedExercises, exerciseMuscleMappings]);

  if (!exerciseData || exerciseData.length === 0) {
    return null;
  }

  return (
    <View className="flex flex-row  justify-around items-center my-2.5 px-5 w-full gap-4 sm:gap-0">
      {/* Front View (Anterior) */}
      <div className="flex-1 flex items-center justify-center w-full sm:w-auto">
        <Body
          data={exerciseData}
          type="anterior"
          bodyColor="#dfdfdf"
          highlightedColors={colorPalette}
          style={{ maxWidth: '200px', width: '100%' }}
          svgStyle={{ width: '100%', height: 'auto' }}
        />
      </div>

      {/* Back View (Posterior) */}
      <div className="flex-1 flex items-center justify-center w-full sm:w-auto">
        <Body
          data={exerciseData}
          type="posterior"
          bodyColor="#dfdfdf"
          highlightedColors={colorPalette}
          style={{ maxWidth: '200px', width: '100%' }}
          svgStyle={{ width: '100%', height: 'auto' }}
        />
      </div>
    </View>
  );
};
