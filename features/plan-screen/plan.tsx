import { api } from '@/convex/_generated/api';
import { THEME } from '@/shared/theme/colours';
import { FontAwesome5 } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from './components/action-button';
import { CreateProgramModal } from './components/create-program-modal';
import { EditProgramModal } from './components/edit-program-modal';
import { PlanCard } from './components/plan-card';

export default function PlanScreen() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const activeProgram = useQuery(api.programs.get_active_program);
    const deactivateProgram = useMutation(api.programs.deactivate_program);
    const createProgram = useMutation(api.programs.create_program);

    const handleDeactivate = () => {
        Alert.alert(
            'Disable Program',
            'This will remove all phases and exercises for this program. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disable',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deactivateProgram({});
                            Alert.alert('Success', 'Program has been disabled and removed');
                        } catch (error) {
                            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to disable program');
                        }
                    },
                },
            ]
        );
    };

    const handleCreateProgram = async (title: string, description: string, numberOfPhases: number) => {
        await createProgram({ title, description, numberOfPhases });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Workout Plan</Text>

                {activeProgram ? (
                    <>
                        <Text style={styles.sectionTitle}>Current Program</Text>
                        <PlanCard
                            title={activeProgram.title}
                            description={activeProgram.description}
                            isActive={true}
                        />
                        
                        <View style={styles.programActions}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => setShowEditModal(true)}
                            >
                                <FontAwesome5 name="edit" size={16} color={THEME.primary} />
                                <Text style={styles.editButtonText}>Edit Program</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.disableButton}
                                onPress={handleDeactivate}
                            >
                                <FontAwesome5 name="times-circle" size={16} color={THEME.error} />
                                <Text style={styles.disableButtonText}>Disable Program</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Current Program</Text>
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="calendar-times" size={48} color={THEME.placeholder} />
                            <Text style={styles.emptyStateText}>No active program</Text>
                            <Text style={styles.emptyStateSubtext}>Create a new program to get started</Text>
                        </View>
                    </>
                )}

                <Text style={styles.sectionTitle}>Actions</Text>
                <ActionButton
                    icon="plus-circle"
                    title="Create a New Program"
                    subtitle="Build your own workout program from scratch."
                    onPress={() => setShowCreateModal(true)}
                    disabled={false}
                />
            </ScrollView>

            <CreateProgramModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateProgram}
            />

            <EditProgramModal
                visible={showEditModal}
                programId={activeProgram?._id || null}
                onClose={() => setShowEditModal(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.background },
    container: { padding: 16 },
    header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 24, textAlign: 'center' },
    sectionTitle: { fontSize: 22, fontWeight: '600', color: THEME.text, marginBottom: 16, marginTop: 8 },
    programActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.primary,
    },
    editButtonText: {
        color: THEME.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    disableButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.error,
    },
    disableButtonText: {
        color: THEME.error,
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: THEME.card,
        borderRadius: 12,
        marginBottom: 24,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: THEME.text,
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: THEME.subtleText,
        marginTop: 8,
        textAlign: 'center',
    },
});

