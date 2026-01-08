
import { THEME } from '@/shared/theme/colours';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SummaryLog } from '../types/summary-log';

export const DiaryActivities = ({
  data,
  onViewMoreInfo
}: {
  data: Record<string, SummaryLog[]>,
  onViewMoreInfo: (workoutId: string, exerciseName: string) => void
}
) => {
  const sortedKeys = useMemo(() => {
    return Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [data])

  console.log(data)

  return (
    <View style={styles.tableContainer}>
      {/* Rows */}
      {sortedKeys.map((row) => (
        <View key={row}>
          <Text style={styles.subHeader}>{row}</Text>
          {data[row].map((exercise) => {
            return (
              <TouchableOpacity
                key={exercise.workoutId + exercise.title}
                onPress={() => onViewMoreInfo(exercise.workoutId, exercise.title)}
              >
                <View style={styles.summaryItem} >
                  <Text style={styles.summaryItemName}>{exercise.title}</Text>
                  <Text style={styles.summaryItemText}>{exercise.summary}</Text>
                  <Text style={styles.summaryItemText}>{exercise.notes}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.background },
  container: { padding: 16 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 16, textAlign: 'center' },
  subHeader: { fontSize: 22, fontWeight: '600', color: THEME.text, marginBottom: 16, textAlign: 'center' },
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
  summaryItem: { backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryItemName: { color: THEME.text, fontSize: 16, fontWeight: 'bold' },
  summaryItemText: { color: THEME.subtleText, fontSize: 14, marginTop: 4 },
});

