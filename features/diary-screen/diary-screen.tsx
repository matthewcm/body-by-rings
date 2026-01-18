'use client';

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useMemo, useState } from 'react';
import { Text, View } from '@/lib/ui/components';
import { ActivityModal } from './components/activity-modal';
import { CalendarWidget } from './components/calendar-widget';
import { DiaryActivities } from './components/diary-table';
import { MetricsWidget } from './components/metrics-widget';
import { MuscleUsageChart } from './components/muscle-usage-chart';
import { PerformanceChart } from './components/performance-chart';
import { SummaryLog } from './types/summary-log';

export default function DiaryScreen() {
  const workoutLogs = useQuery(api.workouts.get_workout_logs);

  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);
  const [activeExercise, setActiveExercise] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const activeDates = useMemo(() => {
    if (!workoutLogs) return new Set<string>();
    const dates = new Set<string>();
    workoutLogs.forEach(log => {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      dates.add(dateKey);
    });
    return dates;
  }, [workoutLogs]);

  const getWeekDates = (date: Date): Date[] => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
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
    
    const weekDates = getWeekDates(selectedDate);
    const weekStart = weekDates[0];
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = weekDates[6];
    weekEnd.setHours(23, 59, 59, 999);
    
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
          const totalVolume = lastPerformance.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0);
          const avgReps = (totalReps / setsCount).toFixed(1);
          return {
            date: new Date(workoutSession.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
            summary: `${setsCount} sets, avg ${avgReps} reps @ ${setIntensity}, volume ${totalVolume}`,
            title: lastPerformance.exerciseName,
            notes: lastPerformance.notes,
            rawDate: new Date(workoutSession.date),
            workoutId: workoutSession._id,
          };
        });
      })
      .flat()
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

    const groupedByDate = sortedLogs.reduce((acc: Record<string, SummaryLog[]>, log) => {
      const dateKey = log.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(log);
      return acc;
    }, {});

    return groupedByDate;
  }, [workoutLogs, selectedDate]);

  const handleViewMoreInfo = (workoutId: string, exerciseName: string) => {
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
    <div className="screen-container w-full">
      <View className="w-full flex flex-col">
        <Text variant="h1" className="text-3xl font-bold text-center mb-6">
          Workout Diary
        </Text>

        <MetricsWidget workoutLogs={workoutLogs} />

        <CalendarWidget
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          activeDates={activeDates}
          onWeekChange={handleWeekChange}
        />

        <PerformanceChart workoutLogs={workoutLogs} />

        <MuscleUsageChart workoutLogs={workoutLogs} />

        <View className="mt-6">
          <DiaryActivities data={recentWorkouts} onViewMoreInfo={handleViewMoreInfo} />
        </View>

        <ActivityModal
          isVisible={isMoreInfoVisible}
          exercise={activeExercise}
          onClose={() => setIsMoreInfoVisible(false)}
        />
      </View>
    </div>
  );
}
