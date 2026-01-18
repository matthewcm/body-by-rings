'use client';

import { api } from '@/convex/_generated/api';
import { View } from '@/lib/ui/components';
import { exerciseMuscleMap } from '@/shared/constants/muscle-mapping';
import { THEME } from '@/shared/theme/colours';
import { generateHexShades } from '@/shared/utils/colors';
import { useQuery } from 'convex/react';
import React, { useMemo } from 'react';
import Body from 'react-body-highlighter';

interface MuscleMapProps {
  performedExercises: string[];
}

export const MuscleMap = ({ performedExercises }: MuscleMapProps) => {
  const exerciseMuscleMappings = useQuery(api.workouts.get_exercise_muscle_mappings);
  const colorPalette = generateHexShades(THEME.error, 6, 20);
  
  // Transform exercises into IExerciseData format for react-body-highlighter
  const exerciseData = useMemo(() => {
    return performedExercises.map(performedExercise => {
      // Try database first
      let muscles: string[] = [];
      if (exerciseMuscleMappings && exerciseMuscleMappings[performedExercise]) {
        muscles = exerciseMuscleMappings[performedExercise];
      } else {
        // Fallback to old constant file if database doesn't have data yet
        const mappedExercise = exerciseMuscleMap.find(
          ex => ex.exercise === performedExercise
        );
        if (mappedExercise) {
          muscles = mappedExercise.muscles;
        }
      }
      
      return {
        name: performedExercise,
        muscles: muscles as any, // Cast to Muscle type since react-body-highlighter uses specific union type
      };
    }).filter(ex => ex.muscles.length > 0);
  }, [performedExercises, exerciseMuscleMappings]);

  if (!exerciseData || exerciseData.length === 0) {
    return null;
  }

  return (
    <View className="flex flex-row justify-around items-center my-2.5 px-5 w-full">
      {/* Front View (Anterior) */}
      <div className="flex-1 flex items-center justify-center">
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
      <div className="flex-1 flex items-center justify-center">
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
