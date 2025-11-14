import React from 'react';
import { View, StyleSheet } from 'react-native';

import Body, { ExtendedBodyPart } from "react-native-body-highlighter";
import { exerciseMuscleMap } from '@/constants/muscle-mapping';
import { THEME } from '@/theme/colours';
import { generateHexShades } from '@/utils/colors';



export const MuscleMap = (
  { performedExercises }: {
    performedExercises: string[];
  }) => {
  const colorPalette = generateHexShades(THEME.error, 6, 20);
  const bodyMap = performedExercises
    .map(performedExercise => {
      return (
        exerciseMuscleMap
          .find(e => e.exercise === performedExercise)?.muscles
          .map(m => ({
            slug: m,
          })) || []
      )
    })
    .flat()

  const muscleCounts = bodyMap.reduce((accumulator: Record<string, number>, muscleSlug) => {
    accumulator[muscleSlug.slug] = (accumulator[muscleSlug.slug] || 0) + 1;
    return accumulator;
  }, {});

  const bodyMapWithIntensity = Object.keys(muscleCounts).map(slug => ({
    slug: slug,
    intensity: muscleCounts[slug],
  }));


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


