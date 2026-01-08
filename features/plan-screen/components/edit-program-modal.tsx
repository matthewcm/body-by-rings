import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '@/shared/theme/colours';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ExercisePickerModal } from './exercise-picker-modal';

interface EditProgramModalProps {
  visible: boolean;
  programId: Id<'programs'> | null;
  onClose: () => void;
}

export const EditProgramModal = ({ visible, programId, onClose }: EditProgramModalProps) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [pendingDay, setPendingDay] = useState<number | null>(null);

  const program = useQuery(
    api.programs.get_program_by_id,
    programId ? { programId } : 'skip'
  );
  
  const allExercises = useQuery(api.workouts.get_all_exercises);
  const templates = useQuery(
    api.programs.get_program_templates,
    programId && selectedPhase ? { programId, phase: selectedPhase } : 'skip'
  );

  const updateTemplate = useMutation(api.programs.update_workout_template);
  const addExercise = useMutation(api.programs.add_program_exercise);
  const deleteTemplate = useMutation(api.programs.delete_workout_template);

  const phases = useMemo(() => {
    if (!program) return [];
    return Array.from({ length: program.numberOfPhases }, (_, i) => i + 1);
  }, [program]);

  const days = useMemo(() => {
    if (!templates) return [];
    const uniqueDays = new Set(templates.map(t => t.day));
    return Array.from(uniqueDays).sort((a, b) => a - b);
  }, [templates]);

  if (!program || !programId) return null;

  const handleAddExercise = (day: number) => {
    if (!allExercises || allExercises.length === 0) {
      Alert.alert('Error', 'No exercises available. Please create exercises first.');
      return;
    }
    setPendingDay(day);
    setShowExercisePicker(true);
  };

  const handleSelectExercise = async (exerciseId: Id<'exerciseCatalog'>) => {
    if (pendingDay === null || !programId) return;

    try {
      await addExercise({
        programId,
        phase: selectedPhase,
        day: pendingDay,
        letter: '',
        exerciseId,
        targetIntensity: 'Medium',
        targetSets: 3,
        targetReps: '8',
        tempo: '2-0-2',
        rest: '60s',
      });
      setPendingDay(null);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add exercise');
      setPendingDay(null);
    }
  };

  const handleDeleteExercise = async (templateId: Id<'workoutTemplates'>) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteTemplate({ templateId });
              // The query should automatically refresh, but we can also manually reset state if needed
              if (result?.success === false) {
                Alert.alert('Error', result.message || 'Failed to delete exercise');
              }
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete exercise');
            }
          },
        },
      ]
    );
  };

  const dayTemplates = selectedDay !== null && templates
    ? templates.filter(t => t.day === selectedDay)
    : [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Program</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={THEME.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.programInfo}>
              <Text style={styles.programTitle}>{program.title}</Text>
              <Text style={styles.programDescription}>{program.description}</Text>
            </View>

            <View style={styles.phaseSelector}>
              <Text style={styles.sectionTitle}>Select Phase</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {phases.map((phase) => (
                  <TouchableOpacity
                    key={phase}
                    style={[
                      styles.phaseButton,
                      selectedPhase === phase && styles.phaseButtonActive,
                    ]}
                    onPress={() => {
                      setSelectedPhase(phase);
                      setSelectedDay(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.phaseButtonText,
                        selectedPhase === phase && styles.phaseButtonTextActive,
                      ]}
                    >
                      Phase {phase}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.daySelector}>
              <Text style={styles.sectionTitle}>Select Day</Text>
              <View style={styles.dayGrid}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDay === day && styles.dayButtonActive,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDay === day && styles.dayButtonTextActive,
                      ]}
                    >
                      Day {day}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addDayButton}
                  onPress={() => {
                    const newDay = days.length > 0 ? Math.max(...days) + 1 : 1;
                    setSelectedDay(newDay);
                  }}
                >
                  <FontAwesome5 name="plus" size={16} color={THEME.primary} />
                  <Text style={styles.addDayButtonText}>Add Day</Text>
                </TouchableOpacity>
              </View>
            </View>

            {selectedDay !== null && (
              <View style={styles.exercisesSection}>
                <View style={styles.exercisesHeader}>
                  <Text style={styles.sectionTitle}>Day {selectedDay} Exercises</Text>
                  <TouchableOpacity
                    style={styles.addExerciseButton}
                    onPress={() => handleAddExercise(selectedDay)}
                  >
                    <FontAwesome5 name="plus" size={14} color={THEME.primary} />
                    <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
                  </TouchableOpacity>
                </View>

                {dayTemplates.length === 0 ? (
                  <Text style={styles.emptyText}>No exercises for this day yet.</Text>
                ) : (
                  dayTemplates.map((template) => (
                    <View key={template._id} style={styles.exerciseCard}>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>
                          {template.exerciseName || 'Unknown Exercise'}
                        </Text>
                        <Text style={styles.exerciseDetails}>
                          {template.targetSets} sets × {template.targetReps} reps
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteExercise(template._id)}
                      >
                        <FontAwesome5 name="trash" size={16} color={THEME.error} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      <ExercisePickerModal
        visible={showExercisePicker}
        exercises={allExercises || []}
        onClose={() => {
          setShowExercisePicker(false);
          setPendingDay(null);
        }}
        onSelect={handleSelectExercise}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: THEME.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  programInfo: {
    marginBottom: 24,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 14,
    color: THEME.subtleText,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 12,
  },
  phaseSelector: {
    marginBottom: 24,
  },
  phaseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: THEME.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  phaseButtonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  phaseButtonText: {
    color: THEME.text,
    fontWeight: '600',
  },
  phaseButtonTextActive: {
    color: '#fff',
  },
  daySelector: {
    marginBottom: 24,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  dayButtonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  dayButtonText: {
    color: THEME.text,
    fontWeight: '600',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  addDayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.primary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addDayButtonText: {
    color: THEME.primary,
    fontWeight: '600',
  },
  exercisesSection: {
    marginBottom: 24,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: THEME.background,
  },
  addExerciseButtonText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: THEME.subtleText,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    color: THEME.placeholder,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
