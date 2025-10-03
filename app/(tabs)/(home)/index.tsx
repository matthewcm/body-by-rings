import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
// --- MOCK DATA FOR PREVIEW ---
// In your local app, you'd use the real Convex import: import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { SafeAreaView } from 'react-native-safe-area-context';
// --- END MOCK DATA ---


const THEME = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  primary: '#BB86FC',
  placeholder: '#6E6E6E',
  activityIndicator: '#BB86FC',
};


const PhaseSelector = ({ selectedPhase, setSelectedPhase, phases }) => (
    <View style={styles.phaseSelectorContainer}>
        {phases.map(phase => (
            <TouchableOpacity
                key={phase}
                style={[styles.phaseButton, selectedPhase === phase && styles.phaseButtonSelected]}
                onPress={() => setSelectedPhase(phase)}
            >
                <Text style={[styles.phaseButtonText, selectedPhase === phase && styles.phaseButtonTextSelected]}>
                    Phase {phase}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

export default function DashboardScreen() {
    const templates = useQuery(api.workouts.getAllWorkoutTemplates);
    const [selectedPhase, setSelectedPhase] = useState(1);

    const availablePhases = useMemo(() => {
        if (!templates) return [1];
        return [...new Set(templates.map(t => t.phase))].sort((a, b) => a - b);
    }, [templates]);

    const uniqueDays = useMemo(() => {
        if (!templates) return [];
        return [...new Set(
            templates
                .filter(t => t.phase === selectedPhase)
                .map(t => t.day)
        )].sort((a, b) => a - b);
    }, [templates, selectedPhase]);

    if (templates === undefined) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={THEME.activityIndicator} />
            </View>
        );
    }
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'Workout Dashboard' }} />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Body By Rings</Text>
                
                <PhaseSelector 
                    selectedPhase={selectedPhase} 
                    setSelectedPhase={setSelectedPhase}
                    phases={availablePhases}
                />

                <Text style={styles.subHeader}>Workouts for Phase {selectedPhase}</Text>

                {uniqueDays.map(day => (
                    <Link key={day} href={{ pathname: `/workout/${selectedPhase}/${day}` }} asChild>
                        <TouchableOpacity style={styles.card}>
                            <Text style={styles.cardText}>Day {day}</Text>
                            <Text style={styles.cardSubText}>
                                {templates.find(t => t.phase === selectedPhase && t.day === day)?.exerciseName}...
                            </Text>
                        </TouchableOpacity>
                    </Link>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.background },
    container: { padding: 16 },
    header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 16, textAlign: 'center' },
    subHeader: { fontSize: 22, fontWeight: '600', color: THEME.text, marginBottom: 20, marginTop: 10 },
    card: { backgroundColor: THEME.card, borderRadius: 12, padding: 20, marginBottom: 16 },
    cardText: { color: THEME.text, fontSize: 18, fontWeight: 'bold' },
    cardSubText: { color: THEME.placeholder, fontSize: 14, marginTop: 4 },
    phaseSelectorContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: THEME.card, borderRadius: 12, padding: 6, marginBottom: 24 },
    phaseButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    phaseButtonSelected: { backgroundColor: THEME.primary },
    phaseButtonText: { color: THEME.placeholder, fontWeight: 'bold', fontSize: 16 },
    phaseButtonTextSelected: { color: THEME.background },
});


