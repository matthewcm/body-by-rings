
import { api } from '@/convex/_generated/api';
import { THEME } from '@/shared/theme/colours';
import { useQuery } from 'convex/react';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityModal } from './components/activity-modal';
import { CalendarWidget } from './components/calendar-widget';
import { DiaryActivities } from './components/diary-table';
import { SummaryLog } from './types/summary-log';


export default function DiaryScreen() {

  const workoutLogs = useQuery(api.workouts.getWorkoutLogs)

  const [isMoreInfoVisible, setIsMoreInfoVisible] = React.useState(false);
  const [activeExercise, setActiveExercise] = React.useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get all dates with workouts for calendar highlighting
  const activeDates = useMemo(() => {
    if (!workoutLogs) return new Set<string>();
    const dates = new Set<string>();
    workoutLogs.forEach(log => {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      dates.add(dateKey);
    });
    return dates;
  }, [workoutLogs]);

  // Get workouts for the selected week
  const getWeekDates = (date: Date): Date[] => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(date);
    monday.setDate(diff);
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const recentWorkouts = useMemo(() => {
    if (!workoutLogs) return {};
    
    // Get the week range for filtering
    const weekDates = getWeekDates(selectedDate);
    const weekStart = weekDates[0];
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = weekDates[6];
    weekEnd.setHours(23, 59, 59, 999);
    
    // Filter workouts for the selected week
    const weekLogs = workoutLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    const sortedLogs = weekLogs
      .map(workoutSession => {
        return workoutSession.performance.map(lastPerformance => {
          if (!lastPerformance || lastPerformance.sets.length === 0) return null;
          const setsCount = lastPerformance.sets.length;
          const totalReps = lastPerformance.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0);
          const setIntensity = lastPerformance.sets.find((s) => s.intensity)?.intensity;
          const totalVolume = lastPerformance.sets.reduce((sum, s) => sum + parseInt(s.reps), 0)
          const avgReps = (totalReps / setsCount).toFixed(1);
          return {
            date: new Date(workoutSession.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
            summary: `${setsCount} sets, avg ${avgReps} reps @ ${setIntensity}, volume ${totalVolume}`,
            title: lastPerformance.exerciseName,
            notes: lastPerformance.notes,
            rawDate: new Date(workoutSession.date),
            workoutId: workoutSession._id,
          };
        })
      })
      .flat()
      .filter(a => a !== null)
      .sort((a, b) => (b?.rawDate.getTime() || 0) - (a?.rawDate.getTime() || 0)); // Sort by most recent first

    const groupedByDate = sortedLogs.reduce((acc: Record<string, SummaryLog[]>, log) => {
      if (!log) return acc;
      const dateKey = log.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(log);
      return acc;
    }, {});

    return groupedByDate
  }, [workoutLogs, selectedDate]);

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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleWeekChange = (date: Date) => {
    setSelectedDate(date);
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

        <CalendarWidget
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          activeDates={activeDates}
          onWeekChange={handleWeekChange}
        />

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

