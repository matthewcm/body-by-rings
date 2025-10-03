import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';

import { api } from "../../../../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';


const THEME = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  primary: '#BB86FC',
  secondary: '#03DAC6',
  accent: '#3700B3',
  placeholder: '#6E6E6E',
  border: '#333333',
  success: '#4CAF50',
  error: '#CF6679',
  activityIndicator: '#BB86FC',
};

const ExerciseCard = ({ exercise, onUpdate, performanceData }) => {
  const safePerformanceData = performanceData || { sets: [], notes: '' };
  const setsToRender = safePerformanceData.sets && safePerformanceData.sets.length > 0
    ? safePerformanceData.sets
    : Array.from({ length: exercise.targetSets }, () => ({ reps: '', intensity: '' }));

  const handleSetChange = (setIndex, field, value) => {
    const newSets = [...setsToRender];
    if (!newSets[setIndex]) newSets[setIndex] = { reps: '', intensity: '' };
    newSets[setIndex][field] = value;
    onUpdate(exercise._id, { ...safePerformanceData, sets: newSets });
  };

  const handleNotesChange = (value) => onUpdate(exercise._id, { ...safePerformanceData, notes: value });

  const addSet = () => {
    const newSets = [...setsToRender, { reps: '', intensity: '' }];
    onUpdate(exercise._id, { ...safePerformanceData, sets: newSets });
  };

  const removeSet = () => {
    const newSets = [...setsToRender];
    newSets.pop();
    onUpdate(exercise._id, { ...safePerformanceData, sets: newSets });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.exerciseTitle}>{exercise.letter}. {exercise.exerciseName}</Text>
      <Text style={styles.exerciseDetail}>Target: {exercise.targetSets} sets x {exercise.targetReps} reps</Text>
      <Text style={styles.exerciseDetail}>Tempo: {exercise.tempo} | Rest: {exercise.rest}</Text>

      <View style={styles.setHeaderRow}>
        <Text style={styles.setHeaderText}>Set</Text>
        <Text style={styles.setHeaderText}>Reps</Text>
        <Text style={styles.setHeaderText}>Intensity</Text>
      </View>

      {setsToRender.map((set, index) => (
        <View key={index} style={styles.setRow}>
          <Text style={styles.setText}>{index + 1}</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={THEME.placeholder}
            placeholder={String(exercise.targetReps)}
            keyboardType="number-pad"
            value={set?.reps || ''}
            onChangeText={(val) => handleSetChange(index, 'reps', val)}
          />
          <TextInput
            style={styles.input}
            placeholderTextColor={THEME.placeholder}
            placeholder={exercise.targetIntensity}
            value={set?.intensity || ''}
            onChangeText={(val) => handleSetChange(index, 'intensity', val)}
          />
        </View>
      ))}

      { setsToRender.length > 1 && 
      <TouchableOpacity style={styles.setButton} onPress={removeSet} disabled={setsToRender.length <= 1}>
        <Text style={styles.setButtonText}>- Remove Set</Text>
      </TouchableOpacity>
      }


      <TouchableOpacity style={styles.setButton} onPress={addSet}>
        <Text style={styles.setButtonText}>+ Add Set</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholderTextColor={THEME.placeholder}
        placeholder="Workout notes..."
        value={safePerformanceData.notes}
        onChangeText={handleNotesChange}
        multiline
      />
    </View>
  );
};

export default function WorkoutScreen() {
  const router = useRouter();
  const { day, phase } = useLocalSearchParams();
  const workoutDay = parseInt(day, 10);

  const [performanceLog, setPerformanceLog] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const templates = useQuery(api.workouts.getWorkoutTemplatesForPhase, {
    phase: Number.parseInt(phase as string)
  });

  const logWorkout = useMutation(api.workouts.logWorkout);

  const exercisesForDay = useMemo(() => {
    if (!templates) return [];
    return templates.filter(e => e.day === workoutDay);
  }, [templates, workoutDay]);

  useEffect(() => {
    if (exercisesForDay.length > 0) {
      const initialLog = {};
      exercisesForDay.forEach(ex => {
        initialLog[ex._id] = {
          exerciseName: ex.exerciseName,
          sets: Array.from({ length: ex.targetSets }, () => ({ reps: '', intensity: '' })),
          notes: ''
        };
      });
      setPerformanceLog(initialLog);
    }
  }, [exercisesForDay]);

  const handleUpdateExercise = (exerciseId, data) => {
    setPerformanceLog(prev => ({ ...prev, [exerciseId]: data }));
  };

  const handleFinish = async () => {
    setIsSaving(true);
    const finalLog = {
      date: new Date().toISOString(),
      day: workoutDay,
      phase: 1,
      performance: Object.values(performanceLog)
        .filter(p => p.sets.some(s => s.reps && s.reps.trim() !== ''))
        .map(p => ({
          ...p,
          sets: p.sets.filter(s => s.reps && s.reps.trim() !== '')
        }))
    };

    try {
      await logWorkout(finalLog);
      setModalVisible(true);
    } catch (error) {
      console.error("Failed to log workout:", error);
      Alert.alert("Error", "Could not save workout.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModalAndGoHome = () => {
    setModalVisible(false);
    router.push('/');
  };

  if (templates === undefined) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={THEME.activityIndicator} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{
        title: `Workout Day ${day}`,
        headerBackTitle: "Dashboard",
        headerTintColor: THEME.primary,
        headerStyle: {
          backgroundColor: THEME.background
        }
      }} />
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeModalAndGoHome}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalText}>Your workout has been saved.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModalAndGoHome}>
              <Text style={styles.buttonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 100, }}>
        {exercisesForDay.map(ex => (
          <ExerciseCard 
            key={ex._id}
            exercise={ex}
            performanceData={performanceLog[ex._id]}
            onUpdate={handleUpdateExercise}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.finishButton]} onPress={handleFinish} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={THEME.background} /> : <Text style={styles.buttonText}>Finish & Save Workout</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.background, alignItems: 'center', justifyContent: 'center' },
  button: { backgroundColor: THEME.primary, paddingVertical: 15, paddingHorizontal: 0, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: THEME.background, fontSize: 18, fontWeight: 'bold' },
  finishButton: { backgroundColor: THEME.success, width: '80%', height: 55 },
  footer: { position: 'absolute', bottom: 0, width: '100%', paddingVertical: 10, alignItems: 'center', backgroundColor: THEME.background, borderTopWidth: 1, borderColor: THEME.border },
  card: {   backgroundColor: THEME.card, borderRadius: 12,  marginHorizontal: 16, marginBottom: 16, justifyContent: 'center', padding: 16 },
  exerciseTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text, marginBottom: 8 },
  exerciseDetail: { fontSize: 14, color: THEME.placeholder, marginBottom: 4 },
  setHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, borderBottomWidth: 1, borderColor: THEME.border, paddingBottom: 8 },
  setHeaderText: { color: THEME.placeholder, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8},
  setText: { color: THEME.text, fontSize: 16, textAlign: 'center', flex: 1 },
  input: { backgroundColor: THEME.background, color: THEME.text, borderRadius: 8, paddingHorizontal: 16, width: '100%', borderWidth: 1, flex: 'flex', justifyContent: 'center', borderColor: THEME.border, paddingVertical: 8, textAlign: 'center', fontSize: 16, marginHorizontal: 4 },
  notesInput: { marginTop: 16, textAlign: 'left', height: 60, paddingTop: 8 },
  setButton: { backgroundColor: THEME.accent, borderRadius: 20, paddingVertical: 8, marginTop: 12, alignItems: 'center' },
  setButtonText: { color: THEME.text, fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContent: { backgroundColor: THEME.card, borderRadius: 20, padding: 35, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: THEME.success, marginBottom: 15 },
  modalText: { marginBottom: 25, textAlign: 'center', color: THEME.text, fontSize: 16 },
  modalButton: { backgroundColor: THEME.primary, borderRadius: 20, padding: 12, width: '100%' },
});


