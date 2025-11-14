
import React, { useState, useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { THEME } from '@/theme/colours';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseCard } from '@/features/exercise-card/exercise-card';
import { WorkoutSummaryModal } from '@/features/workout-summary-modal/workout-summary-modal';
import { isNotNull } from '@/utils/array';
import { PerformanceLog, PerformanceLogs } from '@/modals/exercise';
import { Id } from '@/convex/_generated/dataModel';




export default function WorkoutScreen() {
  const router = useRouter();
  const { phase, day } = useLocalSearchParams<{
    phase: string,
    day: string
  }>();
  const [performanceLog, setPerformanceLog] = useState<PerformanceLogs>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<{ name?: string, summary?: string }[]>([]);

  const templates = useQuery(api.workouts.getAllWorkoutTemplates);
  const lastWorkout = useQuery(api.workouts.getLastWorkoutLog, { phase: parseInt(phase), day: parseInt(day) });
  const logWorkout = useMutation(api.workouts.logWorkout);

  const exercisesForDay = useMemo(() => {
    if (!templates) return [];
    return templates.filter(e => e.phase === parseInt(phase) && e.day === parseInt(day));
  }, [templates, phase, day]);

  useEffect(() => {
    if (exercisesForDay.length > 0) {
      const initialLog: PerformanceLogs = {};
      exercisesForDay.forEach(ex => {
        const lastPerf = lastWorkout?.performance.find(p => p.exerciseName === ex.exerciseName);
        initialLog[ex._id] = {
          exerciseName: ex.exerciseName,
          sets: lastPerf?.sets.map(s => ({ ...s, completed: false })) || Array.from({ length: ex.targetSets }, () => ({ reps: '', intensity: '', completed: false })),
          notes: '',
          lastPerformance: lastPerf,
        };
      });
      setPerformanceLog(initialLog);
    }
  }, [exercisesForDay, lastWorkout]);

  const handleUpdateExercise = (exerciseId: Id<'workoutTemplates'>, data: PerformanceLog) => setPerformanceLog(prev => ({ ...prev, [exerciseId]: data }));

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
      await logWorkout(finalLog);
      setIsSummaryVisible(false);
      router.replace('/');
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
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {exercisesForDay.map(ex => (
          <ExerciseCard key={ex._id} exercise={ex} performanceData={performanceLog[ex._id]} onUpdate={handleUpdateExercise} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.background },
  finishButton: { backgroundColor: THEME.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 20 },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderBottomWidth: 1, borderColor: THEME.border },
  statItem: { alignItems: 'center' },
  statLabel: { color: THEME.placeholder, fontSize: 12, textTransform: 'uppercase' },
  statValue: { color: THEME.text, fontSize: 18, fontWeight: '600' },
});


