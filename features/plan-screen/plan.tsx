import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '@/shared/theme/colours';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from './components/action-button';
import { PlanCard } from './components/plan-card';

export default function PlanScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Workout Plan</Text>

                <Text style={styles.sectionTitle}>Current Program</Text>
                <PlanCard
                    title="Body By Rings Program"
                    description="A 3-phase progressive calisthenics program focused on building strength with gymnastic rings."
                    isActive={true}
                />

                <Text style={styles.sectionTitle}>Future Options</Text>
                <ActionButton
                    icon="exchange-alt"
                    title="Choose a New Plan"
                    subtitle="Select a different pre-made program."
                    disabled={true}
                />
                <ActionButton
                    icon="plus-circle"
                    title="Create a Custom Plan"
                    subtitle="Build your own workout from scratch."
                    disabled={true}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.background },
    container: { padding: 16 },
    header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 24, textAlign: 'center' },
    sectionTitle: { fontSize: 22, fontWeight: '600', color: THEME.text, marginBottom: 16, marginTop: 8 },
});

