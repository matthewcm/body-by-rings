'use client';

import React, { useState } from 'react';
import { Modal, View, Text, Input, ScrollView, TouchableOpacity } from '@/lib/ui/components';
import { Search, X, ChevronRight } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface Exercise {
  _id: Id<'exerciseCatalog'>;
  exerciseName: string;
  muscles?: string[];
  isCustom: boolean;
}

interface ExercisePickerModalProps {
  visible: boolean;
  exercises: Exercise[];
  onClose: () => void;
  onSelect: (exerciseId: Id<'exerciseCatalog'>) => void;
}

export const ExercisePickerModal = ({ visible, exercises, onClose, onSelect }: ExercisePickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = exercises.filter(ex =>
    ex.exerciseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (exerciseId: Id<'exerciseCatalog'>) => {
    onSelect(exerciseId);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} className="max-h-[80vh]">
      <div className="flex flex-col max-h-[80vh]">
        <div className="flex flex-row justify-between items-center p-5 border-b border-border">
          <Text variant="h2" className="text-xl font-bold">
            Select Exercise
          </Text>
          <button
            onClick={onClose}
            className="p-1 hover:bg-card/50 rounded transition-colors"
          >
            <X className="w-5 h-5 text-text" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-10"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-card/50 rounded"
              >
                <X className="w-3.5 h-3.5 text-placeholder" />
              </button>
            )}
          </div>
        </div>

        <ScrollView className="flex-1 overflow-auto">
          <div className="p-4 space-y-2">
            {filteredExercises.length === 0 ? (
              <Text className="text-subtle-text text-center py-8">
                No exercises found
              </Text>
            ) : (
              filteredExercises.map((exercise) => (
                <button
                  key={exercise._id}
                  onClick={() => handleSelect(exercise._id)}
                  className="w-full flex flex-row items-center justify-between p-4 bg-card hover:bg-card/80 rounded-lg transition-colors border border-border"
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-text mb-1">
                      {exercise.exerciseName}
                    </Text>
                    {exercise.muscles && exercise.muscles.length > 0 && (
                      <Text className="text-sm text-subtle-text">
                        {exercise.muscles.slice(0, 3).join(', ')}
                      </Text>
                    )}
                  </View>
                  <ChevronRight className="w-4 h-4 text-placeholder ml-2" />
                </button>
              ))
            )}
          </div>
        </ScrollView>
      </div>
    </Modal>
  );
};
