import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Id } from '@/convex/_generated/dataModel';
import { ProgressionTable } from '@/features/stats-screen/components/progression-table/progression-table';
import { THEME } from '@/shared/theme/colours';
import { generateHexShades } from '@/shared/utils/colors';
import { useMutation, useQuery } from "convex/react";
import Body from "react-native-body-highlighter";
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from "../../convex/_generated/api";




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

export default function StatsScreen() {
  const logs = useQuery(api.workouts.getWorkoutLogs);
  const templates = useQuery(api.workouts.getAllWorkoutTemplates);
  const customTemplates = useQuery(api.workouts.getAllCustomWorkoutTemplates);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState<Id<'customWorkoutTemplates'> | null>(null);
  
  const updateExerciseName = useMutation(api.workouts.updateCustomExerciseName);
  const updateExerciseMuscles = useMutation(api.workouts.updateCustomExerciseMuscles);
  
  // Organize muscles by body region
  const muscleGroups = useMemo(() => {
    return {
      'Upper Body': ['chest', 'deltoids', 'triceps', 'biceps', 'upper-back', 'trapezius', 'forearm', 'hands'],
      'Core': ['abs', 'obliques', 'lower-back'],
      'Lower Body': ['quadriceps', 'hamstring', 'calves', 'gluteal', 'adductors', 'tibialis'],
      'Other': ['neck', 'head', 'feet', 'ankles', 'knees'],
    };
  }, []);
  
  // Get the current custom exercise data when selected
  const currentCustomExercise = useMemo(() => {
    if (!customTemplates || !selectedExercise) return null;
    return customTemplates.find(ex => ex.exerciseName === selectedExercise);
  }, [customTemplates, selectedExercise]);


  const uniqueExercises = useMemo(() => {
    if (!templates) return [];
    return [...new Set(templates.map(t => t.exerciseName))];
  }, [templates]);

  const uniqueCustomExercises = useMemo(() => {
    if (!customTemplates) return [];
    
    const normalizedMap = new Map<string, string>();
    customTemplates.forEach(t => {
      const normalizedKey = normalizeExerciseName(t.exerciseName);
      if (!normalizedMap.has(normalizedKey)) {
        normalizedMap.set(normalizedKey, t.exerciseName);
      }
    });
    return Array.from(normalizedMap.values());
  }, [customTemplates]);

  useEffect(() => {
    if (uniqueExercises.length > 0 && !uniqueExercises.includes(selectedExercise)) {
      if (uniqueCustomExercises.length > 0 && !uniqueCustomExercises.includes(selectedExercise)) {
        setSelectedExercise(uniqueExercises[0]);
      }
    } else if (uniqueExercises.length === 0) {
      setSelectedExercise('');
    }
  }, [uniqueExercises, uniqueCustomExercises, selectedExercise]);

  // Update editing state when exercise changes
  useEffect(() => {
    if (currentCustomExercise) {
      setEditingName(currentCustomExercise.exerciseName);
      setSelectedMuscles(currentCustomExercise.muscles || []);
      setCurrentExerciseId(currentCustomExercise._id);
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditingName('');
      setSelectedMuscles([]);
      setCurrentExerciseId(null);
    }
  }, [currentCustomExercise]);

  const handleSaveExercise = async () => {
    if (!currentExerciseId) return;
    
    try {
      if (editingName !== selectedExercise) {
        await updateExerciseName({ exerciseId: currentExerciseId, newName: editingName });
        setSelectedExercise(editingName);
      }
      await updateExerciseMuscles({ exerciseId: currentExerciseId, muscles: selectedMuscles });
      setIsEditing(false);
      Alert.alert('Success', 'Exercise updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise');
      console.error(error);
    }
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const tableData = useMemo(() => {
    if (!logs || !selectedExercise) return [];
    const normalizedSelectedExercise = normalizeExerciseName(selectedExercise);
    return logs
      .map(log => {
        const performance = log.performance.find(p => 
          normalizeExerciseName(p.exerciseName) === normalizedSelectedExercise
        );
        if (!performance || performance.sets.length === 0) return null;

        const numericSets = performance.sets.map(s => ({
          reps: parseInt(s.reps, 10) || 0,
          intensity: parseFloat(s.intensity) || 0,
        }));

        const maxReps = Math.max(...numericSets.map(s => s.reps));
        const maxIntensity = performance.sets.find(s => s.intensity)?.intensity
        const totalVolume = numericSets.reduce((sum, s) => sum + (s.reps ), 0);

        return {
          date: new Date(log.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
          sets: performance.sets.length,
          maxReps,
          maxIntensity,
          totalVolume: Math.round(totalVolume),
          rawDate: new Date(log.date)
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .sort((a, b) => (b?.rawDate.getTime() || 0) - (a?.rawDate.getTime() || 0)); // Sort by most recent first
  }, [logs, selectedExercise]);

  if (logs === undefined || templates === undefined) {
    return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color={THEME.activityIndicator} /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Progression</Text>


        <Text style={styles.subHeader}>Select an Exercise</Text>
        <View style={styles.chipContainer}>
          {uniqueExercises.map(ex => (
            <TouchableOpacity
              key={ex}
              style={[styles.chip, selectedExercise === ex && styles.chipSelected]}
              onPress={() => setSelectedExercise(ex)}
            >
              <Text style={[styles.chipText, selectedExercise === ex && styles.chipTextSelected]}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subHeader}>Custom Exercises</Text>
        <View style={styles.chipContainer}>
          {uniqueCustomExercises.map(ex => (
            <TouchableOpacity
              key={ex}
              style={[styles.chip, selectedExercise === ex && styles.chipSelected]}
              onPress={() => setSelectedExercise(ex)}
            >
              <Text style={[styles.chipText, selectedExercise === ex && styles.chipTextSelected]}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedExercise && (
          <View style={styles.card}>
            {currentCustomExercise ? (
              <>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNameRow}>
                    {isEditing ? (
                      <TextInput
                        style={styles.exerciseNameInput}
                        value={editingName}
                        onChangeText={setEditingName}
                        placeholder="Exercise name"
                      />
                    ) : (
                      <Text style={styles.chartTitle}>{selectedExercise}</Text>
                    )}
                    {!isEditing && (
                      <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={() => setIsEditing(true)}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {isEditing && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={() => {
                          setIsEditing(false);
                          setEditingName(currentCustomExercise.exerciseName);
                          setSelectedMuscles(currentCustomExercise.muscles || []);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={handleSaveExercise}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {isEditing && (
                  <View style={styles.muscleSection}>
                    <Text style={styles.muscleSectionTitle}>Muscles Worked</Text>
                    {Object.entries(muscleGroups).map(([groupName, muscles]) => (
                      <View key={groupName} style={styles.muscleGroup}>
                        <Text style={styles.muscleGroupTitle}>{groupName}</Text>
                        <View style={styles.muscleChipContainer}>
                          {muscles.map(muscle => (
                            <TouchableOpacity
                              key={muscle}
                              style={[
                                styles.muscleChip,
                                selectedMuscles.includes(muscle) && styles.muscleChipSelected
                              ]}
                              onPress={() => toggleMuscle(muscle)}
                            >
                              <Text style={[
                                styles.muscleChipText,
                                selectedMuscles.includes(muscle) && styles.muscleChipTextSelected
                              ]}>
                                {muscle.replace('-', ' ')}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ))}
                    {selectedMuscles.length > 0 && (
                      <View style={styles.selectedCount}>
                        <Text style={styles.selectedCountText}>
                          {selectedMuscles.length} muscle{selectedMuscles.length !== 1 ? 's' : ''} selected
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {!isEditing && selectedMuscles.length > 0 && (
                  <View style={styles.muscleMapContainer}>
                    <View style={styles.muscleMapWrapper}>
                      <Body
                        data={selectedMuscles.map(slug => ({ slug: slug as any, intensity: 1 }))}
                        gender="male"
                        side="front"
                        scale={0.5}
                        border="#dfdfdf"
                        colors={generateHexShades(THEME.primary, 6, 20)}
                      />
                      <Body
                        data={selectedMuscles.map(slug => ({ slug: slug as any, intensity: 1 }))}
                        gender="male"
                        side="back"
                        scale={0.5}
                        border="#dfdfdf"
                        colors={generateHexShades(THEME.primary, 6, 20)}
                      />
                    </View>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.chartTitle}>{selectedExercise}</Text>
            )}
            <ProgressionTable data={tableData} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.background },
  container: { padding: 16 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 16, textAlign: 'center' },
  subHeader: { fontSize: 22, fontWeight: '600', color: THEME.text, marginBottom: 16 },
  card: { backgroundColor: THEME.card, borderRadius: 12, padding: 16 },
  exerciseHeader: { marginBottom: 16 },
  exerciseNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, textAlign: 'left', flex: 1 },
  exerciseNameInput: { 
    flex: 1, 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: THEME.text, 
    backgroundColor: THEME.background, 
    padding: 12, 
    borderRadius: 8,
    minHeight: 44,
  },
  actionButtons: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  editButton: { backgroundColor: THEME.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  editButtonText: { color: THEME.background, fontWeight: 'bold', fontSize: 14 },
  saveButton: { backgroundColor: THEME.success || '#34C759', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelButton: { backgroundColor: THEME.error, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  cancelButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  muscleSection: { marginBottom: 20 },
  muscleSectionTitle: { fontSize: 18, fontWeight: '600', color: THEME.text, marginBottom: 16 },
  muscleGroup: { marginBottom: 16 },
  muscleGroupTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: THEME.subtleText, 
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  muscleChipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  muscleChip: { 
    backgroundColor: THEME.background, 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: THEME.border,
    minWidth: 80,
  },
  muscleChipSelected: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  muscleChipText: { color: THEME.text, fontSize: 13, textAlign: 'center' },
  muscleChipTextSelected: { color: THEME.background, fontWeight: '600' },
  selectedCount: { 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: THEME.border 
  },
  selectedCountText: { 
    color: THEME.subtleText, 
    fontSize: 14, 
    fontStyle: 'italic',
    textAlign: 'center',
  },
  muscleMapContainer: { marginBottom: 20, alignItems: 'center' },
  muscleMapWrapper: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 8 },
  chip: { backgroundColor: THEME.card, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: THEME.primary },
  chipSelected: { backgroundColor: THEME.primary },
  chipText: { color: THEME.primary },
  chipTextSelected: { color: THEME.background, fontWeight: 'bold' },
  phaseSelectorContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: THEME.card, borderRadius: 12, padding: 6, marginBottom: 24 },
  phaseButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  phaseButtonSelected: { backgroundColor: THEME.primary },
  phaseButtonText: { color: THEME.placeholder, fontWeight: 'bold', fontSize: 16 },
  phaseButtonTextSelected: { color: THEME.background },
  tableContainer: { width: '100%' },
  tableHeader: { backgroundColor: '#333333', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: THEME.border },
  tableCell: { flex: 1, color: THEME.text, textAlign: 'center', fontSize: 12 },
  headerText: { fontWeight: 'bold', color: THEME.primary },
  tablePlaceholder: { color: THEME.placeholder, fontStyle: 'italic', paddingVertical: 40, textAlign: 'center' },
});

