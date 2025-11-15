
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '@/shared/theme/colours';


export const ActionButton = ({ icon, title, subtitle, onPress, disabled = false }:{
  icon: string,
  title: string,
  subtitle: string,
  onPress?: () => void,
  disabled?: boolean
}) => (
    <TouchableOpacity style={[styles.card, styles.actionButton, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled}>
        <FontAwesome5 name={icon} size={24} color={disabled ? THEME.placeholder : THEME.primary} />
        <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.actionTitle, disabled && { color: THEME.placeholder }]}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <FontAwesome5 name="chevron-right" size={16} color={THEME.placeholder} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: { backgroundColor: THEME.card, borderRadius: 12, padding: 16, marginBottom: 16 },
    activeCard: { borderWidth: 2, borderColor: THEME.primary },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, marginLeft: 12 },
    cardDescription: { fontSize: 14, color: THEME.subtleText, marginTop: 4, lineHeight: 20 },
    actionButton: { flexDirection: 'row', alignItems: 'center' },
    disabledButton: { backgroundColor: '#2a2a2a' },
    actionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text },
    actionSubtitle: { fontSize: 13, color: THEME.placeholder, marginTop: 2 },
});

