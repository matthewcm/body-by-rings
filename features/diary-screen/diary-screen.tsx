
import React, { useMemo } from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { THEME } from '@/shared/theme/colours';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { DiaryActivities } from './components/diary-table';
import { SummaryLog } from './types/summary-log';
import { ActivityModal } from './components/activity-modal';


export default function DiaryScreen() {

  const workoutLogs = useQuery(api.workouts.getWorkoutLogs)

  const [isMoreInfoVisible, setIsMoreInfoVisible] = React.useState(false);
  const [activeExercise, setActiveExercise] = React.useState<any>(null);

  const recentWorkouts = useMemo(() => {
    if (!workoutLogs) return {};
    const sortedLogs = workoutLogs

      .map(log => {

        const lastPerformance = log.performance[log.performance.length - 1];

        if (!lastPerformance || lastPerformance.sets.length === 0) return null;
        const setsCount = lastPerformance.sets.length;
        const totalReps = lastPerformance.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0);
        const setIntensity = lastPerformance.sets.find((s) => s.intensity)?.intensity;
        const totalVolume = lastPerformance.sets.reduce((sum, s) => sum + parseInt(s.reps), 0)
        const avgReps = (totalReps / setsCount).toFixed(1);
        return {
          date: new Date(log.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' }),
          summary: `${setsCount} sets, avg ${avgReps} reps @ ${setIntensity}, volume ${totalVolume}`,
          title: lastPerformance.exerciseName,
          notes: lastPerformance.notes,
          rawDate: new Date(log.date),
          workoutId: log._id,
        };
      })
      .filter(a => a !== null)
      .sort((a, b) => (b?.rawDate.getTime() || 0) - (a?.rawDate.getTime() || 0)); // Sort by most recent first

    const groupedByDate = sortedLogs.reduce((acc: Record<string, SummaryLog[]>, log) => {
      const dateKey = log.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(log);
      return acc;
    }, {});

    return groupedByDate
  }, [workoutLogs]);

  const handleViewMoreInfo = (workoutId: string, exerciseName: string) => {

    // should use Convex query here
    const workoutEx = workoutLogs?.find(ex => ex._id === workoutId);
    const activeEx = workoutEx?.performance.find(perf => perf.exerciseName === exerciseName);
    setActiveExercise({
      ...activeEx,
      date: workoutEx ? new Date(workoutEx.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' }) : '',
    });

    setIsMoreInfoVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ActivityModal
        isVisible={isMoreInfoVisible}
        exercise={activeExercise}
        onClose={() => setIsMoreInfoVisible(false)}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Workout Diary</Text>

        <View>
          <DiaryActivities data={recentWorkouts} onViewMoreInfo={handleViewMoreInfo} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME.background },
  container: { padding: 16 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 24, textAlign: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: THEME.text, marginBottom: 16, marginTop: 8 },
});

