import React, { useState, useMemo } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, View } from 'react-native';
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
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WodCard } from '../workout-screen/components/wod-card';
import { scanWODWithAI } from '../ai-scanner/services/ai-scanner';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");



export default function CustomWorkoutScreen() {
  const router = useRouter();
  const { phase, day } = useLocalSearchParams<{ phase: string, day: string }>();

  const [performanceLog, setPerformanceLog] = useState<PerformanceLogs>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<{ name?: string, summary?: string }[]>([]);
  const [templates, setTemplates] = useState<{ _id: Id<'workoutTemplates'>, exerciseName: string }[]>([]);
  const [wodBlocks, setWodBlocks] = useState<any[]>([]);

  const logWorkout = useMutation(api.workouts.logWorkout);
  const createCustomExercise = useMutation(api.workouts.createCustomWorkout);

  const exercisesForDay = useMemo(() => templates || [], [templates]);

  // --- AI SCAN LOGIC ---
  const handleScanWOD = async () => {
    // 1. Request Permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need camera access to scan the WOD board.");
      return;
    }

    // 2. Take Photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0].base64) return;

    setIsScanning(true);
    try {
      const base64Image = result.assets[0].base64
      const parsedData = await scanWODWithAI(base64Image)
      setWodBlocks(parsedData); // Store the WOD grouping logic

      // Also populate the actual loggable templates for each exercise found in the WODs
      const allExercises: any[] = [];
      parsedData.forEach((block: any) => {
        block.exercises.forEach((name: string) => {
          allExercises.push({
            _id: `ex-${uuidv4()}` as Id<'workoutTemplates'>,
            exerciseName: name,
            parentWod: block.title // Optional: track which WOD it belongs to
          });
        });
      });

      setTemplates(prev => [...prev, ...allExercises]);
    } catch (error) {
      console.error(error);
      Alert.alert("Scan Failed", "AI could not structure the CrossFit workout.");
    } finally {
      setIsScanning(false);
    }
  };

  // --- EXISTING HANDLERS ---
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
    setTemplates(prev => ([...prev, { _id: newExId, exerciseName: '' }]))
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
    }).filter(isNotNull);

    setWorkoutSummary(summary);
    setIsSummaryVisible(true);
  };

  const confirmAndSaveWorkout = async () => {
    setIsSaving(true);
    const finalLog = {
      date: new Date().toISOString(),
      day: parseInt(day || '0'),
      phase: parseInt(phase || '0'),
      performance: Object.values(performanceLog)
        .map(p => ({
          exerciseName: p.exerciseName,
          notes: p.notes || '',
          sets: p.sets
            .filter((s) => s.reps && s.reps.trim() !== '')
            .map(s => ({ reps: s.reps.trim(), intensity: s.intensity.trim() }))
        }))
        .filter(p => p.sets.length > 0)
    };
    try {
      for (const ex of exercisesForDay) {
        await createCustomExercise({
          exerciseName: ex.exerciseName,
          phase: 0, day: 0, targetReps: '8', targetSets: 3,
          targetIntensity: 'Medium', letter: '', tempo: '2-0-2', rest: '60s',
        });
      }
      await logWorkout(finalLog);
      setIsSummaryVisible(false);
      router.navigate({ pathname: '(home)' });
    } catch (error) {
      Alert.alert("Error", "Could not save workout.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{
        title: 'Log Workout',
        headerRight: () => (
          <TouchableOpacity style={styles.finishButton} onPress={handleFinishPress} disabled={isSaving}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        ),
      }} />

      <WorkoutSummaryModal
        onConfirm={confirmAndSaveWorkout}
        isVisible={isSummaryVisible}
        workoutSummary={workoutSummary}
        onClose={() => setIsSummaryVisible(false)}
        isSaving={isSaving}
        withMuscleMap={false}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* AI Scanner Button */}
        <View style={styles.scannerContainer}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && { opacity: 0.7 }]}
            onPress={handleScanWOD}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.finishButtonText}>📸 Scan WOD Board</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 1. Show the CrossFit "Summary" Cards first */}
        {wodBlocks.map((block, idx) => (
          <WodCard
            key={idx}
            title={block.title}
            timeCap={block.timeCap}
            repScheme={block.repScheme}
            exercises={block.exercises}
          />
        ))}

        <Text style={styles.sectionHeader}>Log Performance</Text>

        {/* 2. Show the loggable Exercise Cards below */}
        {exercisesForDay.map(ex => (
          <NewExerciseCard
            key={ex._id}
            exercise={ex}
            performanceData={performanceLog[ex._id]}
            onUpdate={handleUpdateExercise}
            onDelete={handleDeleteExercise}
          />
        ))}


        <TouchableOpacity style={styles.createNewExerciseButton} onPress={handleCreateNewExercise}>
          <Text style={styles.finishButtonText}>+ Create new exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.background },
  scannerContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: THEME.border },
  sectionHeader: { textAlign: 'center', margin: 16, color: THEME.text, fontSize: 18, fontWeight: '800', textTransform: 'uppercase' },
  scanButton: {
    backgroundColor: THEME.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  createNewExerciseButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 20
  },
  finishButton: { backgroundColor: THEME.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 20 },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
