import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useCountdown } from '@/shared/hooks/use-countdown';
import { PerformanceLog } from '@/shared/models/exercise';
import { THEME } from '@/shared/theme/colours';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


// --- Helper to get an icon based on exercise name ---
const getExerciseIcon = (_name: string) => {
  // TODO 
  return 'dumbbell';
};

// Normalize exercise name: lowercase and remove pluralization
const normalizeExerciseName = (name: string): string => {
  let normalized = name.toLowerCase().trim();
  // Remove trailing 'es' if word is long enough (e.g., "thrusters" -> "thruster")
  if (normalized.length > 3 && normalized.endsWith('es')) {
    normalized = normalized.slice(0, -2);
  }
  // Remove trailing 's' if word is long enough (e.g., "thrusters" -> "thruster", but keep "push" as "push")
  else if (normalized.length > 2 && normalized.endsWith('s')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

export const NewExerciseCard = ({ exercise, onUpdate, performanceData, onDelete}: {
  exercise: { _id: Id<'workoutTemplates'>; exerciseName: string; };
  onUpdate: (exerciseId: Id<'workoutTemplates'>, data: PerformanceLog) => void;
  onDelete: (exerciseId: Id<'workoutTemplates'>) => void;
  performanceData: PerformanceLog
}) => {
  const setsToRender = performanceData?.sets || [];
  const lastPerformance = performanceData?.lastPerformance;
  const { start: startRest, isActive: isResting, formattedTime: restTime } = useCountdown(90, () => { });
  
  // Autocomplete state
  const customExercises = useQuery(api.workouts.getAllCustomWorkoutTemplates);
  const [exerciseNameInput, setExerciseNameInput] = useState(performanceData?.exerciseName || exercise.exerciseName);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);

  // Get unique exercise names from custom exercises (normalized to prevent duplicates)
  const uniqueCustomExerciseNames = useMemo(() => {
    if (!customExercises) return [];
    const normalizedMap = new Map<string, string>();
    customExercises.forEach(ex => {
      if (ex.exerciseName) {
        const normalizedKey = normalizeExerciseName(ex.exerciseName);
        if (!normalizedMap.has(normalizedKey)) {
          normalizedMap.set(normalizedKey, ex.exerciseName);
        }
      }
    });
    return Array.from(normalizedMap.values()).sort();
  }, [customExercises]);

  // Filter exercises based on input
  const filteredExercises = useMemo(() => {
    if (!exerciseNameInput.trim()) return [];
    const lowerInput = exerciseNameInput.toLowerCase();
    return uniqueCustomExerciseNames.filter(name => 
      name.toLowerCase().includes(lowerInput) && 
      name.toLowerCase() !== lowerInput
    ).slice(0, 5); // Limit to 5 suggestions
  }, [exerciseNameInput, uniqueCustomExerciseNames]);

  // Sync input state with performanceData when it changes externally
  // We intentionally exclude exerciseNameInput from dependencies to avoid infinite loops
  // This effect only syncs external changes, not user input changes
  useEffect(() => {
    const currentName = performanceData?.exerciseName || exercise.exerciseName;
    if (currentName !== exerciseNameInput) {
      setExerciseNameInput(currentName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performanceData?.exerciseName, exercise.exerciseName]);

  const handleExerciseNameChange = (value: string) => {
    setExerciseNameInput(value);
    setShowDropdown(value.trim().length > 0 && filteredExercises.length > 0);
    onUpdate(exercise._id, {
      ...performanceData,
      exerciseName: value
    });
  };

  const handleSelectExercise = (selectedName: string) => {
    setExerciseNameInput(selectedName);
    setShowDropdown(false);
    inputRef.current?.blur();
    onUpdate(exercise._id, {
      ...performanceData,
      exerciseName: selectedName
    });
  };

  const handleInputFocus = () => {
    if (exerciseNameInput.trim().length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleSetChange = (setIndex: number, field: string, value: string) => {
    const newSets = JSON.parse(JSON.stringify(setsToRender));
    newSets[setIndex][field] = value;
    onUpdate(exercise._id, {
      ...performanceData,
      sets: newSets
    });
  };

  const toggleSetComplete = (setIndex: number) => {
    const newSets = JSON.parse(JSON.stringify(setsToRender));
    newSets[setIndex].completed = !newSets[setIndex].completed;
    if (newSets[setIndex].completed) startRest();
    onUpdate(exercise._id, { ...performanceData, sets: newSets });
  };

  const handleNotesChange = (value: string) => onUpdate(exercise._id, { ...performanceData, notes: value });

  const addSet = () => {
    const lastSet = setsToRender[setsToRender.length - 1];
    const newSet = lastSet ? { reps: lastSet.reps, intensity: lastSet.intensity, completed: false } : { reps: '', intensity: '', completed: false };
    onUpdate(exercise._id, { ...performanceData, sets: [...setsToRender, newSet] });
  };

  const removeSet = (setIndex: number) => {
    if (setsToRender.length <= 1) return; // Can't remove the last set
    const newSets = setsToRender.filter((_, index) => index !== setIndex);
    onUpdate(exercise._id, { ...performanceData, sets: newSets });
  };

  const prevSummary = useMemo(() => {
    if (!lastPerformance || lastPerformance.sets.length === 0) return null;
    const setsCount = lastPerformance.sets.length;
    const totalReps = lastPerformance.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0);
    const setIntensity = lastPerformance.sets.find((s) => s.intensity)?.intensity;
    const totalVolume = lastPerformance.sets.reduce((sum, s) => sum + parseInt(s.reps), 0)
    const avgReps = (totalReps / setsCount).toFixed(1);
    return {
      summary: `${setsCount} sets, avg ${avgReps} reps @ ${setIntensity}, volume ${totalVolume}`,
      notes: lastPerformance.notes
    };
  }, [lastPerformance]);

  return (
    <View style={styles.card}>
      <View style={styles.exerciseHeader}>
        <FontAwesome5 name={getExerciseIcon(exerciseNameInput)} size={18} color={THEME.primary} style={{ width: 25 }} />
        <View style={styles.exerciseNameContainer} ref={containerRef}>
          <TextInput
            ref={inputRef}
            style={styles.exerciseTitleInput}
            value={exerciseNameInput}
            onChangeText={handleExerciseNameChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Exercise name"
            placeholderTextColor={THEME.placeholder}
          />
          {showDropdown && filteredExercises.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      index === filteredExercises.length - 1 && styles.dropdownItemLast
                    ]}
                    onPress={() => handleSelectExercise(item)}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                nestedScrollEnabled
                style={styles.dropdownList}
              />
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => onDelete(exercise._id)} style={styles.removeExerciseIcon}>
          <FontAwesome5 name="trash-alt" size={16} color={THEME.error} />
        </TouchableOpacity>
      </View>
      {Boolean(prevSummary) && (
        <View style={styles.prevSummaryContainer}>
          <Text style={styles.prevSummaryText}>{prevSummary?.summary}</Text>
          {Boolean(prevSummary?.notes) && <Text style={styles.prevNotesText}>Notes: {prevSummary?.notes}</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.restTimer} onPress={startRest}>
        <FontAwesome5 name="clock" size={14} color={isResting ? THEME.primary : THEME.subtleText} />
        <Text style={[styles.restTimerText, isResting && { color: THEME.primary }]}>
          {isResting ? restTime : 'Start Rest (1m 30s)'}
        </Text>
      </TouchableOpacity>

      <View style={styles.setHeaderRow}>
        <Text style={styles.setHeaderText}>SET</Text>
        <Text style={styles.setHeaderText}>INTENSITY</Text>
        <Text style={styles.setHeaderText}>REPS</Text>
        <View style={{ width: 50 }} />
      </View>

      {setsToRender.map((set, index) => (
        <View key={index} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
          <Text style={[styles.setText, set.completed && { color: THEME.success }]}>{index + 1}</Text>
          <TextInput style={styles.input} value={set.intensity} onChangeText={(val) => handleSetChange(index, 'intensity', val)} />
          <TextInput style={styles.input} keyboardType="number-pad" value={set.reps} onChangeText={(val) => handleSetChange(index, 'reps', val)} />
          <TouchableOpacity onPress={() => toggleSetComplete(index)} style={[styles.checkButton, set.completed && styles.checkButtonCompleted]}>
            <FontAwesome5 name="check" size={16} color={set.completed ? '#fff' : THEME.subtleText} />
          </TouchableOpacity>
          {setsToRender.length > 1 && (
            <TouchableOpacity onPress={() => removeSet(index)} style={styles.removeSetIcon}>
              <FontAwesome5 name="trash-alt" size={16} color={THEME.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
        <Text style={styles.addSetButtonText}>+ Add Set</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.notesInput}
        placeholder="Add workout notes..."
        placeholderTextColor={THEME.placeholder}
        value={performanceData?.notes || ''}
        onChangeText={handleNotesChange}
        multiline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: THEME.card, borderRadius: 12, margin: 16, marginBottom: 0, padding: 16 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 12, zIndex: 1 },
  exerciseNameContainer: { flex: 1, marginLeft: 12, position: 'relative', zIndex: 10000 },
  exerciseTitleInput: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: THEME.text, 
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: THEME.background,
    borderRadius: 8,
    minHeight: 40,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: THEME.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    marginTop: 4,
    maxHeight: 180,
    zIndex: 10001,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    overflow: 'hidden',
  },
  dropdownList: {
    maxHeight: 180,
    backgroundColor: THEME.background,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.background,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '500',
  },
  restTimer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start', zIndex: 0 },
  restTimerText: { color: THEME.subtleText, marginLeft: 8, fontSize: 14, fontWeight: '500' },
  setHeaderRow: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderColor: THEME.border, zIndex: 0 },
  setHeaderText: { color: THEME.placeholder, fontSize: 12, flex: 1.5, fontWeight: '600' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: THEME.border, gap: 4 },
  setRowCompleted: { backgroundColor: 'rgba(52, 199, 89, 0.1)', borderColor: 'rgba(52, 199, 89, 0.4)', borderWidth: 1, marginHorizontal: -17, paddingHorizontal: 16, borderRadius: 8 },
  setText: { color: THEME.text, fontSize: 16, flex: 0.5, textAlign: 'center' },
  input: { backgroundColor: THEME.background, color: THEME.text, width: 20, paddingHorizontal: 10, paddingVertical: 12, textAlign: 'center', fontSize: 16, flex: 1, borderRadius: 6 },
  checkButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  checkButtonCompleted: { backgroundColor: THEME.success },
  addSetButton: { backgroundColor: 'rgba(93, 95, 239, 0.1)', borderRadius: 8, paddingVertical: 12, marginTop: 16, alignItems: 'center' },
  addSetButtonText: { color: THEME.primary, fontSize: 16, fontWeight: 'bold' },
  notesInput: { backgroundColor: THEME.background, color: THEME.text, borderRadius: 8, padding: 10, fontSize: 14, marginTop: 16, height: 60, textAlignVertical: 'top' },
  removeSetIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  removeExerciseIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  prevSummaryContainer: { backgroundColor: THEME.background, borderRadius: 8, padding: 10, marginBottom: 12 },
  prevSummaryText: { color: THEME.subtleText, fontSize: 13, fontStyle: 'italic' },
  prevNotesText: { color: THEME.subtleText, fontSize: 13, fontStyle: 'italic', marginTop: 4 },
});


