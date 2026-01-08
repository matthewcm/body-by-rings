import { api } from '@/convex/_generated/api';
import { exerciseMuscleMap } from '@/shared/constants/muscle-mapping';
import { THEME } from '@/shared/theme/colours';
import { generateHexShades } from '@/shared/utils/colors';
import { useQuery } from 'convex/react';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Body, { ExtendedBodyPart } from "react-native-body-highlighter";

export const MuscleMap = (
  { performedExercises }: {
    performedExercises: string[];
  }) => {
  const exerciseMuscleMappings = useQuery(api.workouts.get_exercise_muscle_mappings);
  const colorPalette = generateHexShades(THEME.error, 6, 20);
  
  const bodyMapWithIntensity = useMemo(() => {
    const bodyMap = performedExercises
      .map(performedExercise => {
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
        
        return muscles.map(m => ({
          slug: m,
        }));
      })
      .flat();

    const muscleCounts = bodyMap.reduce((accumulator: Record<string, number>, muscleSlug) => {
      accumulator[muscleSlug.slug] = (accumulator[muscleSlug.slug] || 0) + 1;
      return accumulator;
    }, {});

    return Object.keys(muscleCounts).map(slug => ({
      slug: slug,
      intensity: muscleCounts[slug],
    }));
  }, [performedExercises, exerciseMuscleMappings]);


  return (
    <View style={styles.muscleMapContainer}>
      {/* --- FRONT VIEW --- */}
      <Body
        data={bodyMapWithIntensity as ExtendedBodyPart[]}
        gender="male"
        side="front"
        scale={0.5}
        border="#dfdfdf"
        colors={colorPalette}

      />

      {/* --- BACK VIEW --- */}
      <Body
        data={bodyMapWithIntensity as ExtendedBodyPart[]}
        gender="male"
        side="back"
        scale={0.5}
        border="#dfdfdf"
        colors={colorPalette}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  muscleMapContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
});


