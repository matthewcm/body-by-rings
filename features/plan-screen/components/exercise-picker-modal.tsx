import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '@/shared/theme/colours';
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Exercise</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={THEME.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <FontAwesome5 name="search" size={16} color={THEME.placeholder} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises..."
              placeholderTextColor={THEME.placeholder}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <FontAwesome5 name="times" size={14} color={THEME.placeholder} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.content}>
            {filteredExercises.length === 0 ? (
              <Text style={styles.emptyText}>No exercises found</Text>
            ) : (
              filteredExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise._id}
                  style={styles.exerciseItem}
                  onPress={() => handleSelect(exercise._id)}
                >
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                    {exercise.muscles && exercise.muscles.length > 0 && (
                      <Text style={styles.exerciseMuscles}>
                        {exercise.muscles.slice(0, 3).join(', ')}
                      </Text>
                    )}
                  </View>
                  <FontAwesome5 name="chevron-right" size={14} color={THEME.placeholder} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
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
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: THEME.background,
    borderRadius: 8,
    padding: 12,
    color: THEME.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  content: {
    padding: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.background,
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
  exerciseMuscles: {
    fontSize: 12,
    color: THEME.subtleText,
  },
  emptyText: {
    color: THEME.placeholder,
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
