import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '@/shared/theme/colours';

interface CreateProgramModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, numberOfPhases: number) => Promise<void>;
}

export const CreateProgramModal = ({ visible, onClose, onCreate }: CreateProgramModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [numberOfPhases, setNumberOfPhases] = useState('3');

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a program title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a program description');
      return;
    }

    const phases = parseInt(numberOfPhases);
    if (isNaN(phases) || phases < 1 || phases > 10) {
      Alert.alert('Error', 'Please enter a valid number of phases (1-10)');
      return;
    }

    try {
      await onCreate(title.trim(), description.trim(), phases);
      setTitle('');
      setDescription('');
      setNumberOfPhases('3');
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create program');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Program</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={THEME.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Program Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Body By Rings Program"
                placeholderTextColor={THEME.placeholder}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your workout program..."
                placeholderTextColor={THEME.placeholder}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Number of Phases</Text>
              <TextInput
                style={styles.input}
                value={numberOfPhases}
                onChangeText={setNumberOfPhases}
                placeholder="3"
                placeholderTextColor={THEME.placeholder}
                keyboardType="number-pad"
              />
              <Text style={styles.hint}>Enter a number between 1 and 10</Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.createButtonText}>Create Program</Text>
            </TouchableOpacity>
          </View>
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.background,
    borderRadius: 8,
    padding: 12,
    color: THEME.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: THEME.placeholder,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: THEME.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: THEME.primary,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
