

import React, { useState, useMemo } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { THEME } from '@/shared/theme/colours';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutSummaryModal } from '@/features/workout-screen/components/workout-summary-modal';
import { isNotNull } from '@/shared/utils/array';
import { PerformanceLog, PerformanceLogs } from '@/shared/models/exercise';
import { Id } from '@/convex/_generated/dataModel';
import { NewExerciseCard } from './components/new-exercise-card';
import { v4 as uuidv4 } from 'uuid';


export default function CustomWorkoutScreen() {
  const router = useRouter();
  const { phase, day } = useLocalSearchParams<{
    phase: string,
    day: string
  }>();
  const [performanceLog, setPerformanceLog] = useState<PerformanceLogs>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<{ name?: string, summary?: string }[]>([]);

  const [templates, setTemplates] = useState<{_id: Id<'workoutTemplates'>, exerciseName: string}[]>([])
  const logWorkout = useMutation(api.workouts.logWorkout);
  const createCustomExercise = useMutation(api.workouts.createCustomWorkout);

  const exercisesForDay = useMemo(() => {
    if (!templates) return [];
    return templates;
  }, [templates]);

  const handleUpdateExercise = (exerciseId: Id<'workoutTemplates'>, data: PerformanceLog) => {
    setPerformanceLog(prev => ({ ...prev, [exerciseId]: data }));
    setTemplates(prev => prev.map(t => t._id === exerciseId ? { ...t, exerciseName: data.exerciseName } : t));
  }

  const handleDeleteExercise = (exerciseId: Id<'workoutTemplates'>) => {
    setPerformanceLog(prev => {
      const newLog = { ...prev };
      delete newLog[exerciseId];
      return newLog;
    })
    setTemplates(prev => prev.filter(ex => ex._id !== exerciseId));
  }

  const handleCreateNewExercise = () => {
    const newExId = `ex-${uuidv4()}` as Id<'workoutTemplates'>;
    setTemplates(prev => ([...prev, {
       _id: newExId,
       exerciseName: '',
    }]))
  }

  const handleFinishPress = () => {
    const summary = Object.values(performanceLog).map(p => {
      if (!p.sets || p.sets.length === 0) return null;
      const setsCount = p.sets.length;
      const avgReps = (p.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0) / setsCount).toFixed(1);
      const volumeReps = p.sets.reduce((sum, s) => sum + parseInt(s.reps), 0);
      const setIntensity = p.sets.find((s) => s.intensity)?.intensity;
      return {
        name: p.exerciseName,
        summary: `${setsCount} sets, avg ${avgReps} reps @ ${setIntensity}, volume ${volumeReps}`,
      };

    })
      .filter(isNotNull);

    setWorkoutSummary(summary);
    setIsSummaryVisible(true);
  };

  const confirmAndSaveWorkout = async () => {
    setIsSaving(true);
    const finalLog = {
      date: new Date().toISOString(),
      day: parseInt(day),
      phase: parseInt(phase),
      performance: Object.values(performanceLog)
        .map(p => ({
          exerciseName: p.exerciseName,
          notes: p.notes || '',
          sets: p.sets
            .filter((s) => s.reps && s.reps.trim() !== '')
            .map(s => ({
              reps: s.reps.trim(), intensity: s.intensity.trim()
            }))
        }))
        .filter(p => p.sets.length > 0)
    };
    try {
      exercisesForDay.forEach(async (ex) => {
        await createCustomExercise({
          exerciseName: ex.exerciseName,
          phase: 0,
          day: 0,
          targetReps: '8',
          targetSets: 3,
          targetIntensity: 'Medium',
          letter: '',
          tempo: '2-0-2',
          rest: '60s',
        })
      })
      await logWorkout(finalLog);
      setIsSummaryVisible(false);
      router.navigate({pathname: '(home)'});
    } catch (error) {
      Alert.alert("Error", "Could not save workout.",);
      console.error("Error saving workout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (templates === undefined) {
    return <SafeAreaView style={styles.safeArea}><ActivityIndicator size="large" color={THEME.primary} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{
        title: 'Log Workout',
        headerRight: () => (<TouchableOpacity style={styles.finishButton} onPress={handleFinishPress} disabled={isSaving}><Text style={styles.finishButtonText}>Finish</Text></TouchableOpacity>),
      }} />

      <WorkoutSummaryModal
        onConfirm={confirmAndSaveWorkout}
        isVisible={isSummaryVisible}
        workoutSummary={workoutSummary}
        onClose={() => setIsSummaryVisible(false)}
        isSaving={isSaving}
        withMuscleMap={false}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {exercisesForDay.map(ex => (
          <NewExerciseCard 
            key={ex._id}
            exercise={ex}
            performanceData={performanceLog[ex._id]}
            onUpdate={handleUpdateExercise}
            onDelete={handleDeleteExercise}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity style={styles.createNewExerciseButton} onPress={handleCreateNewExercise}> <Text style={styles.finishButtonText}>Create new exercise</Text></TouchableOpacity>)
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.background },
  createNewExerciseButton: { backgroundColor: THEME.primary,  textAlign:'center', width:'auto', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 20 },
  finishButton: { backgroundColor: THEME.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 20 },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderBottomWidth: 1, borderColor: THEME.border },
  statItem: { alignItems: 'center' },
  statLabel: { color: THEME.placeholder, fontSize: 12, textTransform: 'uppercase' },
  statValue: { color: THEME.text, fontSize: 18, fontWeight: '600' },
});


