import { THEME } from "@/theme/colours"
import { Modal, View, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Text } from "react-native"
import { MuscleMap } from "../muscle-map/muscle-map"


export const WorkoutSummaryModal = (
  {
    isVisible,
    workoutSummary,
    isSaving,
    onClose,
    onConfirm

  }: {
    isVisible: boolean,
    onClose: () => void
    onConfirm: () => void
    workoutSummary: {summary?: string, name?: string}[],
    isSaving: boolean

  }
) => {
  return (
    <Modal transparent={true} visible={isVisible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Workout Summary</Text>
          <ScrollView style={{ width: '100%' }}>
            <MuscleMap performedExercises={workoutSummary
              .map(s => s.name)
              .filter(value => {
                return value !== undefined && value !== null;
              })
            } />

            {workoutSummary.map(item => (
              <View key={item.name} style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>{item.name}</Text>
                <Text style={styles.summaryItemText}>{item.summary}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => onClose()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm} disabled={isSaving}>
              {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>Confirm & Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  modalContent: { width: '90%', maxHeight: '90%', backgroundColor: THEME.card, borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.text, marginBottom: 16, textAlign: 'center' },
  summaryItem: { backgroundColor: THEME.background, borderRadius: 8, padding: 12, marginBottom: 8 },
  summaryItemName: { color: THEME.text, fontSize: 16, fontWeight: 'bold' },
  summaryItemText: { color: THEME.subtleText, fontSize: 14, marginTop: 4 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: THEME.border },
  cancelButtonText: { color: THEME.text, fontWeight: 'bold' },
  confirmButton: { backgroundColor: THEME.success },
  confirmButtonText: { color: '#fff', fontWeight: 'bold' },
})

