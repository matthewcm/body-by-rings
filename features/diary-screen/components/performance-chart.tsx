'use client';

import React, { useMemo } from 'react';
import { View, Text, Card } from '@/lib/ui/components';

interface PerformanceChartProps {
  workoutLogs: Array<{
    date: string;
    performance: Array<{
      exerciseName: string;
      sets: Array<{ reps: string; intensity: string }>;
    }>;
  }> | undefined;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ workoutLogs }) => {
  const performanceData = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) {
      return {
        weeklyVolume: [] as Array<{ week: string; volume: number }>,
        maxVolume: 0,
      };
    }

    const weeklyData: Record<string, number> = {};
    
    workoutLogs.forEach(log => {
      const date = new Date(log.date);
      const weekStart = new Date(date);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      let workoutVolume = 0;
      log.performance.forEach(perf => {
        perf.sets.forEach(set => {
          workoutVolume += parseInt(set.reps, 10) || 0;
        });
      });
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey] += workoutVolume;
    });

    const weeklyArray = Object.entries(weeklyData)
      .map(([week, volume]) => ({
        week,
        volume,
      }))
      .sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime())
      .slice(0, 12);

    const maxVolume = Math.max(...weeklyArray.map(w => w.volume), 1);

    return {
      weeklyVolume: weeklyArray.reverse(),
      maxVolume,
    };
  }, [workoutLogs]);

  const formatWeekLabel = (weekDateStr: string): string => {
    const date = new Date(weekDateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <Card className="p-4 mb-4">
      <Text variant="h3" className="text-lg font-bold mb-4">
        Weekly Volume
      </Text>
      <View className="min-h-[150px]">
        {performanceData.weeklyVolume.length > 0 ? (
          <div className="flex flex-row items-end justify-around h-[150px]">
            {performanceData.weeklyVolume.map((week) => {
              const heightPercent = (week.volume / performanceData.maxVolume) * 100;
              return (
                <div key={week.week} className="flex-1 flex flex-col items-center justify-end px-0.5">
                  <div className="w-full h-[120px] flex items-end mb-1">
                    <div
                      className="w-full bg-primary rounded min-h-[4px]"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    />
                  </div>
                  <Text className="text-xs text-subtle-text text-center">
                    {formatWeekLabel(week.week)}
                  </Text>
                </div>
              );
            })}
          </div>
        ) : (
          <Text className="text-sm text-subtle-text text-center py-10">
            No performance data yet
          </Text>
        )}
      </View>
    </Card>
  );
};
