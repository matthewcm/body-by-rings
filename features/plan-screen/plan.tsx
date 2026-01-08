import { api } from '@/convex/_generated/api';
import { THEME } from '@/shared/theme/colours';
import { FontAwesome5 } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from './components/action-button';
import { ConfirmModal } from './components/confirm-modal';
import { CreateProgramModal } from './components/create-program-modal';
import { EditProgramModal } from './components/edit-program-modal';
import { PlanCard } from './components/plan-card';

export default function PlanScreen() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDisableConfirm, setShowDisableConfirm] = useState(false);

    const activeProgram = useQuery(api.programs.get_active_program);
    const allPrograms = useQuery(api.programs.get_all_programs);
    const deactivateProgram = useMutation(api.programs.deactivate_program);
    const activateProgram = useMutation(api.programs.activate_program);
    const createProgram = useMutation(api.programs.create_program);

    const handleDeactivate = async () => {
        try {
            const result = await deactivateProgram({});
            if (result?.success) {
                setShowDisableConfirm(false);
                // The query will automatically refresh and show the empty state
            } else {
                // Show error if needed
                console.error('Failed to disable program:', result?.message);
            }
        } catch (error) {
            console.error('Error disabling program:', error);
        }
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
                                onPress={() => setShowDisableConfirm(true)}
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
                            <Text style={styles.emptyStateSubtext}>Create a new program or switch to an existing one</Text>
                        </View>
                    </>
                )}

                {allPrograms && allPrograms.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>All Programs</Text>
                        {allPrograms.map((program) => (
                            <TouchableOpacity
                                key={program._id}
                                style={[
                                    styles.programCard,
                                    program.isActive && styles.activeProgramCard,
                                ]}
                                onPress={async () => {
                                    if (!program.isActive) {
                                        try {
                                            await activateProgram({ programId: program._id });
                                        } catch (error) {
                                            console.error('Error activating program:', error);
                                        }
                                    }
                                }}
                            >
                                <View style={styles.programCardContent}>
                                    <View style={styles.programCardHeader}>
                                        <Text style={styles.programCardTitle}>{program.title}</Text>
                                        {program.isActive && (
                                            <View style={styles.activeBadge}>
                                                <Text style={styles.activeBadgeText}>Active</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.programCardDescription}>{program.description}</Text>
                                    <Text style={styles.programCardPhases}>
                                        {program.numberOfPhases} phase{program.numberOfPhases !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                                {!program.isActive && (
                                    <TouchableOpacity
                                        style={styles.switchButton}
                                        onPress={async () => {
                                            try {
                                                await activateProgram({ programId: program._id });
                                            } catch (error) {
                                                console.error('Error activating program:', error);
                                            }
                                        }}
                                    >
                                        <FontAwesome5 name="check" size={14} color={THEME.primary} />
                                        <Text style={styles.switchButtonText}>Switch to</Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        ))}
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

            <ConfirmModal
                visible={showDisableConfirm}
                title="Disable Program"
                message="This will deactivate the current program. You can switch back to it later. Your custom workouts will remain available. Continue?"
                confirmText="Disable"
                cancelText="Cancel"
                destructive={true}
                onConfirm={handleDeactivate}
                onCancel={() => setShowDisableConfirm(false)}
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
    programCard: {
        backgroundColor: THEME.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    activeProgramCard: {
        borderColor: THEME.primary,
        borderWidth: 2,
    },
    programCardContent: {
        flex: 1,
    },
    programCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    programCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.text,
        flex: 1,
    },
    activeBadge: {
        backgroundColor: THEME.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    activeBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    programCardDescription: {
        fontSize: 14,
        color: THEME.subtleText,
        marginBottom: 8,
        lineHeight: 20,
    },
    programCardPhases: {
        fontSize: 12,
        color: THEME.placeholder,
    },
    switchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: THEME.background,
        borderWidth: 1,
        borderColor: THEME.primary,
        alignSelf: 'flex-start',
    },
    switchButtonText: {
        color: THEME.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});

