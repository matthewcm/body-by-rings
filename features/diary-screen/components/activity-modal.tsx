
import { THEME } from "@/shared/theme/colours"
import { Modal, View, ScrollView, TouchableOpacity, StyleSheet, Text } from "react-native"
import { MuscleMap } from "../../../shared/components/muscle-map/muscle-map"
import { FontAwesome5 } from "@expo/vector-icons"


export const ActivityModal = (
  {
    isVisible,
    exercise,
    onClose,
    withMuscleMap = true
  }: {
    isVisible: boolean,
    onClose: () => void
    exercise: {
      exerciseName: string,
      notes: string,
      sets: { intensity: string, reps: string }[],
      date: string
    }
    withMuscleMap?: boolean
  }
) => {
  return (
    <Modal transparent={true} visible={isVisible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Exercise Summary</Text>
          {exercise && (
            <ScrollView style={{ width: '100%' }}>
              {withMuscleMap !== false && (
                <MuscleMap performedExercises={[exercise.exerciseName]}
                />
              )}

              <View>

                <Text style={styles.summaryItemName}>
                  {exercise.date}
                </Text>


              </View>


              <View style={styles.card}>
                <View style={styles.exerciseHeader}>
                  <FontAwesome5 name={'dumbbell'} size={18} color={THEME.primary} style={{ width: 25 }} />
                  <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
                </View>
                {Boolean(exercise.notes) && (
                  <View style={styles.prevSummaryContainer}>
                    {Boolean(exercise?.notes) && <Text style={styles.prevNotesText}>Notes: {exercise?.notes}</Text>}
                  </View>
                )}

                <View style={styles.setHeaderRow}>
                  <Text style={styles.setHeaderText}>INTENSITY</Text>
                  <Text style={styles.setHeaderText}>REPS</Text>
                  <View style={{ width: 50 }} />
                </View>

                {exercise.sets.map((set, index) => (
                  <View key={index} style={[styles.setRow]}>
                    <Text style={styles.tableCell}>{set.intensity}</Text>
                    <Text style={styles.tableCell}>{set.reps}</Text>
                  </View>
                ))}


              </View>
            </ScrollView>
          )}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => onClose()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
  summaryItem: { backgroundColor: THEME.background, borderRadius: 8, padding: 12, marginBottom: 8, flex: 1, flexDirection: 'column', gap: '1rem' },
  summaryItemName: { color: THEME.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  summaryItemText: { color: THEME.subtleText, fontSize: 14, marginTop: 4 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: THEME.border },
  cancelButtonText: { color: THEME.text, fontWeight: 'bold' },
  confirmButton: { backgroundColor: THEME.success },
  confirmButtonText: { color: '#fff', fontWeight: 'bold' },



  safeArea: { flex: 1, backgroundColor: THEME.background },
  container: { padding: 16 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 16, textAlign: 'center' },
  subHeader: { fontSize: 22, fontWeight: '600', color: THEME.text, marginBottom: 16 },
  card: { backgroundColor: THEME.card, borderRadius: 12, padding: 16 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, marginBottom: 20, textAlign: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 8 },
  chip: { backgroundColor: THEME.card, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: THEME.primary },
  chipSelected: { backgroundColor: THEME.primary },
  chipText: { color: THEME.primary },
  chipTextSelected: { color: THEME.background, fontWeight: 'bold' },
  phaseSelectorContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: THEME.card, borderRadius: 12, padding: 6, marginBottom: 24 },
  phaseButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  phaseButtonSelected: { backgroundColor: THEME.primary },
  phaseButtonText: { color: THEME.placeholder, fontWeight: 'bold', fontSize: 16 },
  phaseButtonTextSelected: { color: THEME.background },
  tableContainer: { width: '100%' },
  tableHeader: { backgroundColor: '#333333', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: THEME.border },
  tableCell: { flex: 1, color: THEME.text, textAlign: 'center', fontSize: 12 },
  headerText: { fontWeight: 'bold', color: THEME.primary },
  tablePlaceholder: { color: THEME.placeholder, fontStyle: 'italic', paddingVertical: 40, textAlign: 'center' },



  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  exerciseTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text, marginLeft: 12 },
  restTimer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  restTimerText: { color: THEME.subtleText, marginLeft: 8, fontSize: 14, fontWeight: '500' },
  setHeaderRow: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderColor: THEME.border },
  setHeaderText: { color: THEME.placeholder, fontSize: 12, flex: 1.5, fontWeight: '600', textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: THEME.border, gap: 4 },
  setRowCompleted: { backgroundColor: 'rgba(52, 199, 89, 0.1)', borderColor: 'rgba(52, 199, 89, 0.4)', borderWidth: 1, marginHorizontal: -17, paddingHorizontal: 16, borderRadius: 8 },
  setText: { color: THEME.text, fontSize: 16, flex: 0.5, textAlign: 'center' },
  input: { backgroundColor: THEME.background, color: THEME.text, width: 20, paddingHorizontal: 10, paddingVertical: 12, textAlign: 'center', fontSize: 16, flex: 1, borderRadius: 6 },
  checkButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  checkButtonCompleted: { backgroundColor: THEME.success },
  addSetButton: { backgroundColor: 'rgba(93, 95, 239, 0.1)', borderRadius: 8, paddingVertical: 12, marginTop: 16, alignItems: 'center' },
  addSetButtonText: { color: THEME.primary, fontSize: 16, fontWeight: 'bold' },
  notesInput: { backgroundColor: THEME.background, color: THEME.text, borderRadius: 8, padding: 10, fontSize: 14, marginTop: 16, height: 60, textAlignVertical: 'top' },
  removeSetIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  prevSummaryContainer: { backgroundColor: THEME.background, borderRadius: 8, padding: 10, marginBottom: 12 },
  prevSummaryText: { color: THEME.subtleText, fontSize: 13, fontStyle: 'italic' },
  prevNotesText: { color: THEME.subtleText, fontSize: 13, fontStyle: 'italic', marginTop: 4 },
})

