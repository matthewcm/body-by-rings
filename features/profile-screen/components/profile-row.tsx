
import { THEME } from '@/shared/theme/colours';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ProfileRow = ({ icon, label, value }:{
  icon:string,
  label:string,
  value: string
}) => (
    <View style={styles.row}>
        <FontAwesome5 name={icon} size={16} color={THEME.subtleText} style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: THEME.border, paddingBottom: 12 },
    icon: { width: 25 },
    label: { color: THEME.subtleText, fontSize: 16, flex: 1 },
    value: { color: THEME.text, fontSize: 16, fontWeight: '600' },
});


