'use client';

import { useMemo } from 'react';
import { View, Text, TouchableOpacity, Card } from '@/lib/ui/components';
import { SummaryLog } from '../types/summary-log';

export const DiaryActivities = ({
  data,
  onViewMoreInfo
}: {
  data: Record<string, SummaryLog[]>;
  onViewMoreInfo: (workoutId: string, exerciseName: string) => void;
}) => {
  const sortedKeys = useMemo(() => {
    return Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [data]);

  return (
    <View className="w-full">
      {sortedKeys.map((row) => (
        <div key={row} className="mb-6">
          <Text variant="h3" className="text-xl font-semibold mb-4 text-center">
            {row}
          </Text>
          <div className="space-y-2">
            {data[row].map((exercise) => {
              return (
                <button
                  key={exercise.workoutId + exercise.title}
                  onClick={() => onViewMoreInfo(exercise.workoutId, exercise.title)}
                  className="w-full"
                >
                  <Card className="p-3 mb-2 flex flex-col items-center justify-center hover:bg-card/80 transition-colors">
                    <Text className="text-base font-bold text-text mb-1">
                      {exercise.title}
                    </Text>
                    <Text className="text-sm text-subtle-text mt-1">
                      {exercise.summary}
                    </Text>
                    {exercise.notes && (
                      <Text className="text-sm text-subtle-text mt-1">
                        {exercise.notes}
                      </Text>
                    )}
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </View>
  );
};
