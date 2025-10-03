import React, { useMemo, useState, useEffect } from 'react';
// The import below has been changed from 'react-native-web' to 'react-native' for preview compatibility.
// In your local Expo project, this import is correct as is.
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
// --- MOCK DATA & COMPONENTS FOR PREVIEW ---
// This section mocks functionality that relies on your full Expo and Convex setup.
const MOCK_LOGS = [
    { _id: 'log1', date: '2025-09-15T10:00:00Z', performance: [{ exerciseName: 'Ring Dip', sets: [{ reps: '8', intensity: '10' }, { reps: '7', intensity: '10' }] }] },
    { _id: 'log2', date: '2025-09-22T10:00:00Z', performance: [{ exerciseName: 'Ring Dip', sets: [{ reps: '8', intensity: '12.5' }, { reps: '8', intensity: '12.5' }] }] },
    { _id: 'log3', date: '2025-09-29T10:00:00Z', performance: [{ exerciseName: 'Ring Dip', sets: [{ reps: '9', intensity: '12.5' }, { reps: '8', intensity: '12.5' }] }] },
    { _id: 'log4', date: '2025-09-25T10:00:00Z', performance: [{ exerciseName: 'Chinup', sets: [{ reps: '5', intensity: '5' }] }] },
];
const MOCK_TEMPLATES = [{ exerciseName: 'Ring Dip' }, { exerciseName: 'Chinup' }];
// const useQuery = (query) => {
//     if (query === "api.workouts.getWorkoutLogs") return MOCK_LOGS;
//     if (query === "api.workouts.getWorkoutTemplates") return MOCK_TEMPLATES;
//     return [];
// };


// Mock SVG components for preview compatibility. Your app will use the real 'react-native-svg' library.
const Svg = ({ children }) => <View style={{ width: 320, height: 200, borderWidth: 1, borderColor: THEME.placeholder, padding: 10 }}>{children}</View>;
const G = ({ children }) => <View>{children}</View>;
const Line = () => <View style={{ height: 1, backgroundColor: THEME.placeholder, width: '100%', marginVertical: 5 }} />;
const Circle = () => <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.primary, margin: 2 }} />;
const SvgText = ({ children }) => <Text style={{ color: THEME.text, fontSize: 10 }}>{children}</Text>;
// --- END MOCK DATA & COMPONENTS ---

const THEME = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  primary: '#BB86FC',
  placeholder: '#6E6E6E',
  activityIndicator: '#BB86FC',
};

const LineChart = ({ data }) => {
    if (!data || data.length < 2) {
        return <Text style={styles.chartPlaceholder}>Not enough data to display a chart.</Text>;
    }
    
    // This is a simplified representation for the preview environment.
    // The real 'react-native-svg' will render a proper line chart.
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 10 }}>
            <Text style={{ color: THEME.text, marginBottom: 10 }}>Chart Preview</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: THEME.placeholder }}>
                {data.map((p, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                         <Text style={{ color: THEME.text, fontSize: 12 }}>{p.value}</Text>
                         <View style={{ height: `${p.value / Math.max(...data.map(d=>d.value)) * 80}%`, width: 10, backgroundColor: THEME.primary, borderRadius: 2 }}/>
                         <Text style={{ color: THEME.placeholder, fontSize: 10 }}>{p.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};


export default function StatsScreen() {
    const logs = useQuery(api.workouts.getWorkoutLogs);
    const templates = useQuery(api.workouts.getWorkoutTemplates);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const uniqueExercises = useMemo(() => {
        if (!templates) return [];
        return [...new Set(templates.map(t => t.exerciseName))];
    }, [templates]);
    
    useEffect(() => {
        if (!selectedExercise && uniqueExercises.length > 0) {
            setSelectedExercise(uniqueExercises[0]);
        }
    }, [uniqueExercises, selectedExercise]);

    const chartData = useMemo(() => {
        if (!logs || !selectedExercise) return [];
        return logs
            .map(log => {
                const performance = log.performance.find(p => p.exerciseName === selectedExercise);
                if (!performance) return null;
                const maxIntensity = Math.max(...performance.sets.map(s => parseFloat(s.intensity) || 0));
                return {
                    label: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: maxIntensity,
                };
            })
            .filter(Boolean)
            .sort((a,b) => new Date(a.date) - new Date(b.date));
    }, [logs, selectedExercise]);

    if (logs === undefined) {
        return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color={THEME.activityIndicator} /></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Progression</Text>
                
                <View style={styles.selectorContainer}>
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

                <View style={styles.card}>
                    <Text style={styles.chartTitle}>{selectedExercise} - Max Intensity (kg/lb)</Text>
                    <LineChart data={chartData} />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.background },
    container: { padding: 16 },
    header: { fontSize: 28, fontWeight: 'bold', color: THEME.text, marginBottom: 24, },
    card: { backgroundColor: THEME.card, borderRadius: 12, padding: 16, alignItems: 'center' },
    chartTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text, marginBottom: 20 },
    chartPlaceholder: { color: THEME.placeholder, fontStyle: 'italic', padding: 20 },
    selectorContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 8 },
    chip: {
        backgroundColor: THEME.card,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: THEME.primary
    },
    chipSelected: { backgroundColor: THEME.primary },
    chipText: { color: THEME.primary },
    chipTextSelected: { color: THEME.background, fontWeight: 'bold' }
});


