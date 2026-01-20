'use client';

import { ActivityIndicator, Button, Modal, ScrollView, Text, View } from '@/lib/ui/components';
import { MuscleMap } from '@/shared/components/muscle-map/muscle-map';

interface WorkoutSummaryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workoutSummary: { summary?: string; name?: string }[];
  isSaving: boolean;
  withMuscleMap?: boolean;
}

export const WorkoutSummaryModal = ({
  isVisible,
  workoutSummary,
  isSaving,
  onClose,
  onConfirm,
  withMuscleMap = true,
}: WorkoutSummaryModalProps) => {
  return (
    <Modal visible={isVisible} onClose={onClose} className="max-w-2xl w-[90%] max-h-[90vh]">
      <div className="p-5 flex flex-col max-h-[90vh]">
        <Text variant="h2" className="text-2xl font-bold text-center mb-4">
          Workout Summary
        </Text>
        
        <ScrollView className="flex-1 overflow-auto w-full mb-5">
          {withMuscleMap && (
            <MuscleMap
              performedExercises={workoutSummary
                .map(s => s.name)
                .filter((value): value is string => value !== undefined && value !== null)
              }
            />
          )}

          <div className="space-y-2 mt-4">
            {workoutSummary.map((item, idx) => (
              <div key={idx} className="bg-background rounded-lg p-3 mb-2">
                <Text className="text-base font-bold text-text mb-1">
                  {item.name}
                </Text>
                <Text className="text-sm text-subtle-text mt-1">
                  {item.summary}
                </Text>
              </div>
            ))}
          </div>
        </ScrollView>

        <View className="flex flex-row gap-3 mt-5">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 bg-success hover:bg-success/90"
          >
            {isSaving ? (
              <ActivityIndicator size="small" />
            ) : (
              'Save'
            )}
          </Button>
        </View>
      </div>
    </Modal>
  );
};
