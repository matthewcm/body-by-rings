import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '@/shared/theme/colours';
import { SafeAreaView } from 'react-native-safe-area-context';

const PlanCard = ({ title, description, isActive }) => (
    <View style={[styles.card, isActive && styles.activeCard]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <FontAwesome5 name="shield-alt" size={20} color={THEME.primary} />
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardDescription}>{description}</Text>
        {isActive && <Text style={styles.activeBadge}>Active</Text>}
    </View>
);

const ActionButton = ({ icon, title, subtitle, onPress, disabled = false }) => (
    <TouchableOpacity style={[styles.card, styles.actionButton, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled}>
        <FontAwesome5 name={icon} size={24} color={disabled ? THEME.placeholder : THEME.primary} />
        <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.actionTitle, disabled && { color: THEME.placeholder }]}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <FontAwesome5 name="chevron-right" size={16} color={THEME.placeholder} />
    </TouchableOpacity>
);


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
    card: { backgroundColor: THEME.card, borderRadius: 12, padding: 16, marginBottom: 16 },
    activeCard: { borderWidth: 2, borderColor: THEME.primary },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, marginLeft: 12 },
    cardDescription: { fontSize: 14, color: THEME.subtleText, marginTop: 4, lineHeight: 20 },
    activeBadge: { color: THEME.primary, fontWeight: 'bold', position: 'absolute', top: 16, right: 16 },
    actionButton: { flexDirection: 'row', alignItems: 'center' },
    disabledButton: { backgroundColor: '#2a2a2a' },
    actionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text },
    actionSubtitle: { fontSize: 13, color: THEME.placeholder, marginTop: 2 },
});

