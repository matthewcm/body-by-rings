// This object maps exercise names to an array of muscle group keys.
// These keys correspond to the IDs in the MuscleMapSVG component.
export const muscleMapping = {
  // Chest, Shoulders, Triceps
  'Ring Dip': ['chest', 'shoulders', 'triceps'],
  'Archer Pushup': ['chest', 'shoulders', 'triceps'],
  'Chest Fly': ['chest'],
  'Handstand Pushup': ['shoulders', 'triceps'],
  'Shoulder Pushup': ['shoulders', 'triceps'],
  'Bulgarian Pushup': ['chest', 'shoulders', 'triceps'],
  'Diamond Pushup': ['triceps', 'chest'],
  'Tricep Dip': ['triceps'],
  'Tricep Extension': ['triceps'],
  'Shoulder Shrug': ['traps'],
  'Shoulder Tap': ['core', 'shoulders'],
  'Waist Tap': ['core', 'shoulders'],

  // Back, Biceps, Core
  'Chinup': ['lats', 'biceps'],
  'Mantle Chinup': ['lats', 'biceps'],
  'Archer Chinup': ['lats', 'biceps'],
  'Wide Pullup': ['lats', 'back_upper'],
  'Bodyweight Row': ['lats', 'back_upper', 'biceps'],
  'Archer Bodyweight Row': ['lats', 'back_upper', 'biceps'],
  'L-Row': ['lats', 'back_upper', 'biceps'],
  'Single Arm Row': ['lats', 'back_upper'],
  'Pelican Curl': ['biceps', 'shoulders'],
  'Pelican Curl Negative': ['biceps', 'shoulders'],
  'Bodyweight Bicep Curl': ['biceps'],
  'Face Pull': ['back_upper', 'shoulders_rear'],
  'Rear Delt Fly': ['shoulders_rear', 'back_upper'],
  'Ring Rollout': ['core', 'lats'],
  'Two Arm Hang': ['forearms', 'lats'],
  'One Arm Hang': ['forearms', 'lats'],
};

