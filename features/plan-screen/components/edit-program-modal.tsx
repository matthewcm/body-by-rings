'use client';

import React, { useState, useMemo } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, Button } from '@/lib/ui/components';
import { X, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ExercisePickerModal } from './exercise-picker-modal';
import { ConfirmModal } from './confirm-modal';
import { cn } from '@/lib/utils';

interface EditProgramModalProps {
  visible: boolean;
  programId: Id<'programs'> | null;
  onClose: () => void;
}

export const EditProgramModal = ({ visible, programId, onClose }: EditProgramModalProps) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<Id<'workoutTemplates'> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const program = useQuery(
    api.programs.get_program_by_id,
    programId ? { programId } : 'skip'
  );
  
  const allExercises = useQuery(api.workouts.get_all_exercises);
  const templates = useQuery(
    api.programs.get_program_templates,
    programId && selectedPhase ? { programId, phase: selectedPhase } : 'skip'
  );

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
      setError('No exercises available. Please create exercises first.');
      return;
    }
    setPendingDay(day);
    setShowExercisePicker(true);
    setError(null);
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
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add exercise');
      setPendingDay(null);
    }
  };

  const handleDeleteExercise = async (templateId: Id<'workoutTemplates'>) => {
    setPendingDeleteId(templateId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      const result = await deleteTemplate({ templateId: pendingDeleteId });
      if (result?.success === false) {
        setError(result.message || 'Failed to delete exercise');
      } else {
        setError(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete exercise');
    } finally {
      setPendingDeleteId(null);
      setShowDeleteConfirm(false);
    }
  };

  const dayTemplates = selectedDay !== null && templates
    ? templates.filter(t => t.day === selectedDay)
    : [];

  return (
    <>
      <Modal visible={visible} onClose={onClose} className="max-h-[90vh]">
        <div className="flex flex-col max-h-[90vh]">
          <div className="flex flex-row justify-between items-center p-5 border-b border-border">
            <Text variant="h2" className="text-2xl font-bold">
              Edit Program
            </Text>
            <button
              onClick={onClose}
              className="p-1 hover:bg-card/50 rounded transition-colors"
            >
              <X className="w-5 h-5 text-text" />
            </button>
          </div>

          <ScrollView className="flex-1 overflow-auto p-5">
            <div className="space-y-6">
              <div className="mb-6">
                <Text variant="h3" className="text-xl font-bold mb-2">
                  {program.title}
                </Text>
                <Text className="text-subtle-text text-sm leading-5">
                  {program.description}
                </Text>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-error/10 border border-error/20">
                  <Text className="text-error text-sm">{error}</Text>
                </div>
              )}

              <div>
                <Text variant="h3" className="text-lg font-semibold mb-3">
                  Select Phase
                </Text>
                <div className="flex flex-row gap-2 overflow-x-auto pb-2">
                  {phases.map((phase) => (
                    <button
                      key={phase}
                      onClick={() => {
                        setSelectedPhase(phase);
                        setSelectedDay(null);
                      }}
                      className={cn(
                        'px-4 py-2 rounded-lg border transition-colors whitespace-nowrap',
                        selectedPhase === phase
                          ? 'bg-primary border-primary text-background'
                          : 'bg-background border-border text-text hover:bg-card/50'
                      )}
                    >
                      <Text className={cn('font-semibold', selectedPhase === phase && 'text-background')}>
                        Phase {phase}
                      </Text>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Text variant="h3" className="text-lg font-semibold mb-3">
                  Select Day
                </Text>
                <div className="flex flex-row flex-wrap gap-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        'px-4 py-2 rounded-lg border transition-colors',
                        selectedDay === day
                          ? 'bg-primary border-primary text-background'
                          : 'bg-background border-border text-text hover:bg-card/50'
                      )}
                    >
                      <Text className={cn('font-semibold', selectedDay === day && 'text-background')}>
                        Day {day}
                      </Text>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const newDay = days.length > 0 ? Math.max(...days) + 1 : 1;
                      setSelectedDay(newDay);
                    }}
                    className="px-4 py-2 rounded-lg border border-dashed border-primary bg-background text-primary hover:bg-card/50 transition-colors flex flex-row items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <Text className="font-semibold text-primary">Add Day</Text>
                  </button>
                </div>
              </div>

              {selectedDay !== null && (
                <div>
                  <div className="flex flex-row justify-between items-center mb-3">
                    <Text variant="h3" className="text-lg font-semibold">
                      Day {selectedDay} Exercises
                    </Text>
                    <button
                      onClick={() => handleAddExercise(selectedDay)}
                      className="flex flex-row items-center gap-1.5 px-3 py-1.5 rounded-md bg-background text-primary hover:bg-card/50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <Text className="text-sm font-semibold text-primary">Add Exercise</Text>
                    </button>
                  </div>

                  {dayTemplates.length === 0 ? (
                    <Text className="text-placeholder text-sm italic text-center py-5">
                      No exercises for this day yet.
                    </Text>
                  ) : (
                    <div className="space-y-2">
                      {dayTemplates.map((template) => (
                        <div
                          key={template._id}
                          className="flex flex-row justify-between items-center bg-background p-3 rounded-lg"
                        >
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-text mb-1">
                              {template.exercise?.exerciseName || template.exerciseName || 'Unknown Exercise'}
                            </Text>
                            <Text className="text-sm text-subtle-text">
                              {template.targetSets} sets × {template.targetReps} reps
                            </Text>
                          </View>
                          <button
                            onClick={() => handleDeleteExercise(template._id)}
                            className="p-2 hover:bg-error/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-error" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollView>
        </div>
      </Modal>

      <ExercisePickerModal
        visible={showExercisePicker}
        exercises={allExercises || []}
        onClose={() => {
          setShowExercisePicker(false);
          setPendingDay(null);
        }}
        onSelect={handleSelectExercise}
      />

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete Exercise"
        message="Are you sure you want to remove this exercise?"
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setPendingDeleteId(null);
        }}
      />
    </>
  );
};
