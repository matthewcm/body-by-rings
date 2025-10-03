import { THEME } from "@/theme/colours";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const PhaseSelector = ({ selectedPhase, setSelectedPhase, phases }) => (
    <View style={styles.phaseSelectorContainer}>
        {phases.map(phase => (
            <TouchableOpacity
                key={phase}
                style={[styles.phaseButton, selectedPhase === phase && styles.phaseButtonSelected]}
                onPress={() => setSelectedPhase(phase)}
            >
                <Text style={[styles.phaseButtonText, selectedPhase === phase && styles.phaseButtonTextSelected]}>
                    Phase {phase}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.background },
    container: { padding: 16 },
    header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 16, textAlign: 'center' },
    subHeader: { fontSize: 22, fontWeight: '600', color: THEME.text, marginBottom: 20, marginTop: 10 },
    card: { backgroundColor: THEME.card, borderRadius: 12, padding: 20, marginBottom: 16 },
    cardText: { color: THEME.primary, fontSize: 18, fontWeight: 'bold' },
    cardSubText: { color: THEME.placeholder, fontSize: 14, marginTop: 4 },
    phaseSelectorContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: THEME.card, borderRadius: 12, padding: 6, marginBottom: 24 },
    phaseButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    phaseButtonSelected: { backgroundColor: THEME.primary },
    phaseButtonText: { color: THEME.placeholder, fontWeight: 'bold', fontSize: 16 },
    phaseButtonTextSelected: { color: THEME.background },
});


