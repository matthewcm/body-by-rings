import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '@/shared/theme/colours';


export const PlanCard = ({ title, description, isActive }: {
  title: string,
  description: string,
  isActive: boolean
}) => (
    <View style={[styles.card, isActive && styles.activeCard]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <FontAwesome5 name="shield-alt" size={20} color={THEME.primary} />
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardDescription}>{description}</Text>
        {isActive && <Text style={styles.activeBadge}>Active</Text>}
    </View>
);

const styles = StyleSheet.create({
    card: { backgroundColor: THEME.card, borderRadius: 12, padding: 16, marginBottom: 16 },
    activeCard: { borderWidth: 2, borderColor: THEME.primary },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, marginLeft: 12 },
    cardDescription: { fontSize: 14, color: THEME.subtleText, marginTop: 4, lineHeight: 20 },
    activeBadge: { color: THEME.primary, fontWeight: 'bold', position: 'absolute', top: 16, right: 16 },
});

