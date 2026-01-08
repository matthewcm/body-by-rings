/**
 * @deprecated This constant is deprecated. Muscle mappings are now stored in the database.
 * Use `api.workouts.get_exercise_muscle_mappings` query instead.
 * This file is kept temporarily for reference during migration.
 * 
 * To seed the database with this data, call the `seedMuscleMappings` mutation from `convex/seed-muscle-data.ts`
 */
export const exerciseMuscleMap = [
  // Pushing Exercises
  { exercise: 'Ring Dip', muscles: ['chest', 'deltoids', 'triceps'] },
  { exercise: 'Archer Pushup', muscles: ['chest', 'deltoids', 'triceps', 'obliques'] },
  { exercise: 'Chest Fly', muscles: ['chest'] },
  { exercise: 'Handstand Pushup', muscles: ['deltoids', 'triceps', 'upper-back'] },
  { exercise: 'Shoulder Pushup', muscles: ['deltoids', 'triceps'] },
  { exercise: 'Bulgarian Pushup', muscles: ['chest', 'deltoids', 'triceps'] },
  { exercise: 'Diamond Pushup', muscles: ['triceps', 'chest'] },
  { exercise: 'Tricep Dip', muscles: ['triceps'] },
  { exercise: 'Tricep Extension', muscles: ['triceps', 'abs'] },
  { exercise: 'Shoulder Shrug', muscles: ['trapezius'] },
  { exercise: 'Shoulder Tap', muscles: ['abs', 'obliques', 'deltoids'] },
  { exercise: 'Waist Tap', muscles: ['abs', 'obliques', 'deltoids'] },

  // Pulling Exercises
  { exercise: 'Chinup', muscles: ['upper-back', 'biceps'] },
  { exercise: 'Mantle Chinup', muscles: ['upper-back', 'biceps', 'obliques'] },
  { exercise: 'Archer Chinup', muscles: ['upper-back', 'biceps', 'obliques'] },
  { exercise: 'Wide Pullup', muscles: ['upper-back'] },
  { exercise: 'Bodyweight Row', muscles: ['upper-back', 'biceps'] },
  { exercise: 'Archer Bodyweight Row', muscles: ['upper-back', 'biceps', 'obliques'] },
  { exercise: 'L-Row', muscles: ['upper-back', 'biceps', 'abs'] },
  { exercise: 'Single Arm Row', muscles: ['upper-back', 'obliques'] },
  { exercise: 'Pelican Curl', muscles: ['biceps', 'deltoids', 'chest'] },
  { exercise: 'Pelican Curl Negative', muscles: ['biceps', 'deltoids', 'chest'] },
  { exercise: 'Bodyweight Bicep Curl', muscles: ['biceps'] },
  { exercise: 'Face Pull', muscles: ['upper-back', 'deltoids'] },
  { exercise: 'Rear Delt Fly', muscles: ['deltoids', 'upper-back'] },
  { exercise: 'Ring Rollout', muscles: ['abs', 'upper-back'] },
  { exercise: 'Two Arm Hang', muscles: ['forearm', 'upper-back'] },
  { exercise: 'One Arm Hang', muscles: ['forearm', 'upper-back', 'obliques'] },
];

