import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { THEME } from '@/theme/colours';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseCard } from '@/features/exercise-card/exercise-card';

export default function WorkoutScreen() {
  const router = useRouter();
  const { phase, day } = useLocalSearchParams();
  const [performanceLog, setPerformanceLog] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState([]);

  const templates = useQuery(api.workouts.getAllWorkoutTemplates);
  const lastWorkout = useQuery(api.workouts.getLastWorkoutLog, { phase: parseInt(phase), day: parseInt(day) });
  const logWorkout = useMutation(api.workouts.logWorkout);

  const exercisesForDay = useMemo(() => {
    if (!templates) return [];
    return templates.filter(e => e.phase === parseInt(phase) && e.day === parseInt(day));
  }, [templates, phase, day]);

  useEffect(() => {
    if (exercisesForDay.length > 0) {
      const initialLog = {};
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

  const handleUpdateExercise = (exerciseId, data) => setPerformanceLog(prev => ({ ...prev, [exerciseId]: data }));

  const handleFinishPress = () => {
    const summary = Object.values(performanceLog).map(p => {
      if (!p.sets || p.sets.length === 0) return null;
      const setsCount = p.sets.length;
      const avgReps = (p.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0) / setsCount).toFixed(1);
      const setIntensity = p.sets.find((s) => s.intensity).intensity;
      return {
        name: p.exerciseName,
        summary: `${setsCount} sets, avg ${avgReps} reps @ ${setIntensity}`
      };

    }).filter(Boolean);

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
          notes: p.notes,
          sets: p.sets
        .filter(s => s.reps && s.reps.trim() !== '')
        .map(s => ({reps: s.reps.trim(), intensity: s.intensity.trim()
          }))
        }))
        .filter(p => p.sets.length > 0)
    };
    try {
      await logWorkout(finalLog);
      setIsSummaryVisible(false);
      router.replace('/');
    } catch (error) {
      Alert.alert("Error", "Could not save workout.");
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

      {/* --- Summary Modal --- */}
      <Modal transparent={true} visible={isSummaryVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Workout Summary</Text>
            <ScrollView style={{ width: '100%' }}>
              {workoutSummary.map(item => (
                <View key={item.name} style={styles.summaryItem}>
                  <Text style={styles.summaryItemName}>{item.name}</Text>
                  <Text style={styles.summaryItemText}>{item.summary}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsSummaryVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={confirmAndSaveWorkout} disabled={isSaving}>
                {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>Confirm & Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  modalContent: { width: '90%', maxHeight: '70%', backgroundColor: THEME.card, borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.text, marginBottom: 16, textAlign: 'center' },
  summaryItem: { backgroundColor: THEME.background, borderRadius: 8, padding: 12, marginBottom: 8 },
  summaryItemName: { color: THEME.text, fontSize: 16, fontWeight: 'bold' },
  summaryItemText: { color: THEME.subtleText, fontSize: 14, marginTop: 4 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: THEME.border },
  cancelButtonText: { color: THEME.text, fontWeight: 'bold' },
  confirmButton: { backgroundColor: THEME.success },
  confirmButtonText: { color: '#fff', fontWeight: 'bold' },
});


