import { THEME } from '@/theme/colours';
import { View, Text, StyleSheet } from 'react-native';

export const ProgressionTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <Text style={styles.tablePlaceholder}>No logs found for this exercise in this phase.</Text>;
  }

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>Date</Text>
        <Text style={[styles.tableCell, styles.headerText]}>Sets</Text>
        <Text style={[styles.tableCell, styles.headerText]}>Max Reps</Text>
        <Text style={[styles.tableCell, styles.headerText]}>Max Intensity</Text>
        <Text style={[styles.tableCell, styles.headerText]}>Volume</Text>
      </View>
      {/* Rows */}
      {data.map((row, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>{row.date}</Text>
          <Text style={styles.tableCell}>{row.sets}</Text>
          <Text style={styles.tableCell}>{row.maxReps}</Text>
          <Text style={styles.tableCell}>{row.maxIntensity}</Text>
          <Text style={styles.tableCell}>{row.totalVolume}</Text>
        </View>
      ))}
    </View>
  );
};


const styles = StyleSheet.create({
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
});

