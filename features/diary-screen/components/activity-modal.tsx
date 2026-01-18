'use client';

import { Button, Card, Modal, ScrollView, Text, View } from '@/lib/ui/components';
import { MuscleMap } from '@/shared/components/muscle-map/muscle-map';
import { Dumbbell, X } from 'lucide-react';

interface ActivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  exercise: {
    exerciseName: string;
    notes: string;
    sets: { intensity: string; reps: string }[];
    date: string;
  } | null;
  withMuscleMap?: boolean;
}

export const ActivityModal = ({
  isVisible,
  exercise,
  onClose,
  withMuscleMap = true,
}: ActivityModalProps) => {
  if (!exercise) return null;

  return (
    <Modal visible={isVisible} onClose={onClose} className="max-w-2xl w-[90%] max-h-[90vh]">
      <div className="p-5 flex flex-col max-h-[90vh]">
        <div className="flex flex-row justify-between items-center mb-4">
          <Text variant="h2" className="text-2xl font-bold">
            Exercise Summary
          </Text>
          <button
            onClick={onClose}
            className="p-1 hover:bg-card/50 rounded transition-colors"
          >
            <X className="w-5 h-5 text-text" />
          </button>
        </div>

        <ScrollView className="flex-1 overflow-auto w-full mb-5">
          {withMuscleMap && (
            <MuscleMap performedExercises={[exercise.exerciseName]} />
          )}

          <div className="mb-4">
            <Text className="text-base font-bold text-center text-text">
              {exercise.date}
            </Text>
          </div>

          <Card className="p-4">
            <View className="flex flex-row items-center mb-2 gap-3">
              <Dumbbell className="w-4.5 h-4.5 text-primary flex-shrink-0" />
              <Text variant="h3" className="text-xl font-bold">
                {exercise.exerciseName}
              </Text>
            </View>

            {exercise.notes && (
              <div className="bg-background rounded-lg p-2.5 mb-3">
                <Text className="text-sm italic text-subtle-text">
                  Notes: {exercise.notes}
                </Text>
              </div>
            )}

            <View className="flex flex-row pb-2 mb-2 border-b border-border">
              <Text className="text-xs font-semibold text-placeholder flex-[1.5] text-center">
                INTENSITY
              </Text>
              <Text className="text-xs font-semibold text-placeholder flex-[1.5] text-center">
                REPS
              </Text>
              <div className="w-[50px]" />
            </View>

            <div className="space-y-1">
              {exercise.sets.map((set, index) => (
                <div
                  key={index}
                  className="flex flex-row items-center py-1 border-b border-border gap-4"
                >
                  <Text className="flex-1 text-center text-sm text-text">
                    {set.intensity}
                  </Text>
                  <Text className="flex-1 text-center text-sm text-text">
                    {set.reps}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </ScrollView>

        <View className="flex flex-row gap-3 mt-5">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </View>
      </div>
    </Modal>
  );
};
