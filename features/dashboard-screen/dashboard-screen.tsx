import { Link, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { authStyles } from '@/features/sign-in-screen/styles/auth-styles';
import { SignOutButton } from '@/shared/components/sign-out-button';
import { THEME } from '@/shared/theme/colours';
import { SignedIn, useUser } from '@clerk/clerk-expo';
import { useQuery } from "convex/react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from "../../convex/_generated/api";
import { PhaseSelector } from './components/phase-selector/phase-selector';



export default function Dashboard() {
  const templates = useQuery(api.workouts.get_all_workout_templates);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const user = useUser().user;

  const phases = useQuery(api.phases.get_phases);

  const availablePhases = useMemo(() => {
    if (!phases) return [1];
    return [...new Set(phases.map(t => t.phase))].sort((a, b) => a - b);
  }, [phases]);

  const uniqueDays = useMemo(() => {
    if (!templates || templates.length === 0) return [];
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
        <SignedIn>
          <View style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center', justifyContent: 'space-between' }}>
            <Text style={authStyles.subtitle}>Welcome {user?.firstName || user?.primaryEmailAddress?.emailAddress}</Text>
            <SignOutButton />
          </View>
        </SignedIn>
        <Text style={styles.header}>XCEED</Text>

 
 {phases && phases.length > 0 && (
        <PhaseSelector
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
          phases={availablePhases}
        />
 )}

        <Text style={styles.subHeader}>Workouts for Phase {selectedPhase}</Text>

        {uniqueDays.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No workouts available for Phase {selectedPhase}</Text>
            <Text style={styles.emptyStateSubtext}>Create a program and add exercises to get started</Text>
          </View>
        ) : (
          uniqueDays.map(day => (
            <Link key={day} href={{ pathname: `/workout/${selectedPhase}/${day}` }} asChild>
              <TouchableOpacity style={styles.card}>
                <Text style={styles.cardText}>Day {`${day} : ${phases?.find(t => t.phase === selectedPhase && t.day === day)?.type || ''}`}
                </Text>
                <Text style={styles.cardSubText}>
                  {phases?.find(t => t.phase === selectedPhase && t.day === day)?.title || `Day ${day} workout`}
                </Text>

                <Text style={styles.cardSubText}>
                  Tap to start your session
                </Text>
              </TouchableOpacity>
            </Link>
          ))
        )}

          <Link href={{ pathname: `/custom-workout` }} asChild>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardText}>Custom Workout
              </Text>
              <Text style={styles.cardSubText}>
                Create your own workout session
              </Text>

              <Text style={styles.cardSubText}>
                Tap to start your session
              </Text>
            </TouchableOpacity>
          </Link>
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
  cardText: { color: THEME.primary, fontSize: 18, fontWeight: 'bold' },
  cardSubText: { color: THEME.placeholder, fontSize: 14, marginTop: 4 },
  phaseSelectorContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: THEME.card, borderRadius: 12, padding: 6, marginBottom: 24 },
  phaseButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  phaseButtonSelected: { backgroundColor: THEME.primary },
  phaseButtonText: { color: THEME.placeholder, fontWeight: 'bold', fontSize: 16 },
  phaseButtonTextSelected: { color: THEME.background },
  emptyState: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: THEME.subtleText,
    textAlign: 'center',
  },
});


