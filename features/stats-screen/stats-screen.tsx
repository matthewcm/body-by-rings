import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressionTable } from '@/features/stats-screen/components/progression-table/progression-table';
import { THEME } from '@/shared/theme/colours';




export default function StatsScreen() {
  const logs = useQuery(api.workouts.getWorkoutLogs);
  const templates = useQuery(api.workouts.getAllWorkoutTemplates);
  const customTemplates = useQuery(api.workouts.getAllCustomWorkoutTemplates);
  const [selectedExercise, setSelectedExercise] = useState<string>('');


  const uniqueExercises = useMemo(() => {
    if (!templates) return [];
    return [...new Set(templates.map(t => t.exerciseName))];
  }, [templates]);

  const uniqueCustomExercises = useMemo(() => {
    if (!customTemplates) return [];
    return [...new Set(customTemplates.map(t => t.exerciseName))];
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

  const tableData = useMemo(() => {
    if (!logs || !selectedExercise) return [];
    return logs
      .map(log => {
        const performance = log.performance.find(p => p.exerciseName === selectedExercise);
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
      .filter(a => a !== null)
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

        <View style={styles.card}>
          <Text style={styles.chartTitle}>{selectedExercise || 'Select an exercise'}</Text>
          <ProgressionTable data={tableData} />
        </View>
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
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, marginBottom: 20, textAlign: 'center' },
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

