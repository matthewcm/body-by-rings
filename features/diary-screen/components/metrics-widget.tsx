'use client';

import React, { useMemo } from 'react';
import { View, Text, Card } from '@/lib/ui/components';

interface MetricsWidgetProps {
  workoutLogs: Array<{
    date: string;
    performance: Array<{
      exerciseName: string;
      sets: Array<{ reps: string; intensity: string }>;
    }>;
  }> | undefined;
}

export const MetricsWidget: React.FC<MetricsWidgetProps> = ({ workoutLogs }) => {
  const metrics = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) {
      return {
        workoutsThisYear: 0,
        workoutsThisWeek: 0,
        currentStreak: 0,
      };
    }

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutDates = new Set<string>();
    workoutLogs.forEach(log => {
      const logDate = new Date(log.date);
      workoutDates.add(logDate.toISOString().split('T')[0]);
    });

    const workoutsThisYear = Array.from(workoutDates).filter(dateStr => {
      const date = new Date(dateStr);
      return date >= startOfYear;
    }).length;

    const workoutsThisWeek = Array.from(workoutDates).filter(dateStr => {
      const date = new Date(dateStr);
      return date >= startOfWeek;
    }).length;

    let currentStreak = 0;
    
    if (workoutDates.size > 0) {
      const sortedDates = Array.from(workoutDates)
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const mostRecent = new Date(sortedDates[0]);
      mostRecent.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        let expectedDate = new Date(mostRecent);
        for (const dateStr of sortedDates) {
          const workoutDate = new Date(dateStr);
          workoutDate.setHours(0, 0, 0, 0);
          
          if (workoutDate.getTime() === expectedDate.getTime()) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else if (workoutDate < expectedDate) {
            break;
          }
        }
      }
    }

    return {
      workoutsThisYear,
      workoutsThisWeek,
      currentStreak,
    };
  }, [workoutLogs]);

  return (
    <Card className="p-4 mb-4">
      <Text variant="h3" className="text-lg font-bold mb-3">
        Activity Metrics
      </Text>
      <View className="flex flex-row justify-around">
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-primary mb-1">
            {metrics.workoutsThisYear}
          </Text>
          <Text className="text-xs text-subtle-text uppercase font-semibold">
            This Year
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-primary mb-1">
            {metrics.workoutsThisWeek}
          </Text>
          <Text className="text-xs text-subtle-text uppercase font-semibold">
            This Week
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-primary mb-1">
            {metrics.currentStreak}
          </Text>
          <Text className="text-xs text-subtle-text uppercase font-semibold">
            Day Streak
          </Text>
        </View>
      </View>
    </Card>
  );
};
