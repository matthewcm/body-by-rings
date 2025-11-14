import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '@/theme/colours';
import { useCountdown } from '@/features/countdown/hooks/use-countdown';
import { PerformanceLog } from '@/modals/exercise';
import { Id } from '@/convex/_generated/dataModel';


// --- Helper to get an icon based on exercise name ---
const getExerciseIcon = (_name: string) => {
  // TODO 
  return 'dumbbell';
};

export const ExerciseCard = ({ exercise, onUpdate, performanceData }: {
  exercise: { _id: Id<'workoutTemplates'>; exerciseName: string; };
  onUpdate: (exerciseId: Id<'workoutTemplates'>, data: PerformanceLog) => void;
  performanceData: PerformanceLog
}) => {
  const setsToRender = performanceData?.sets || [];
  const lastPerformance = performanceData?.lastPerformance;
  const { start: startRest, isActive: isResting, formattedTime: restTime } = useCountdown(90, () => { });

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
        <FontAwesome5 name={getExerciseIcon(exercise.exerciseName)} size={18} color={THEME.primary} style={{ width: 25 }} />
        <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
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
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  exerciseTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text, marginLeft: 12 },
  restTimer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  restTimerText: { color: THEME.subtleText, marginLeft: 8, fontSize: 14, fontWeight: '500' },
  setHeaderRow: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderColor: THEME.border },
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

  prevSummaryContainer: { backgroundColor: THEME.background, borderRadius: 8, padding: 10, marginBottom: 12 },
  prevSummaryText: { color: THEME.subtleText, fontSize: 13, fontStyle: 'italic' },
  prevNotesText: { color: THEME.subtleText, fontSize: 13, fontStyle: 'italic', marginTop: 4 },
});


