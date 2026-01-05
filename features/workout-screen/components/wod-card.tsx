import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/shared/theme/colours';

interface WodCardProps {
  title: string;
  timeCap?: string;
  repScheme?: string;
  exercises: string[];
}

export const WodCard = ({ title, timeCap, repScheme, exercises }: WodCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {repScheme && <Text style={styles.repScheme}>{repScheme}</Text>}
        </View>
        {timeCap && (
          <View style={styles.timeCapBadge}>
            <Text style={styles.timeCapText}>⏱ {timeCap}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.exerciseList}>
        {exercises.map((ex, i) => (
          <View key={i} style={styles.exerciseItem}>
            <Text style={styles.exerciseText}>• {ex}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.card,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { color: THEME.text, fontSize: 18, fontWeight: '800', textTransform: 'uppercase' },
  repScheme: { color: THEME.primary, fontSize: 16, fontWeight: '700', marginTop: 2, fontFamily: 'monospace' },
  timeCapBadge: { backgroundColor: '#ef444420', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#ef4444' },
  timeCapText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
  exerciseList: { borderTopWidth: 1, borderTopColor: THEME.border, paddingTop: 12 },
  exerciseItem: { marginVertical: 4 },
  exerciseText: { color: THEME.text, fontSize: 15, opacity: 0.9 },
});
