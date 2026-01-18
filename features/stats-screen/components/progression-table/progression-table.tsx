'use client';

import React from 'react';
import { View, Text, Card } from '@/lib/ui/components';

export const ProgressionTable = ({ data }: {
  data?: {
    date: string;
    sets: number;
    maxReps: number;
    maxIntensity?: string;
    totalVolume?: number;
  }[]
}) => {
  if (!data || data.length === 0) {
    return (
      <Text className="text-placeholder italic py-10 text-center">
        No logs found for this exercise in this phase.
      </Text>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Header */}
      <div className="flex flex-row bg-[#333333] rounded-t-lg">
        <Text className="flex-[2] text-text text-center py-3 text-xs font-bold text-primary">
          Date
        </Text>
        <Text className="flex-1 text-text text-center py-3 text-xs font-bold text-primary">
          Sets
        </Text>
        <Text className="flex-1 text-text text-center py-3 text-xs font-bold text-primary">
          Max Reps
        </Text>
        <Text className="flex-1 text-text text-center py-3 text-xs font-bold text-primary">
          Max Intensity
        </Text>
        <Text className="flex-1 text-text text-center py-3 text-xs font-bold text-primary">
          Volume
        </Text>
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {data.map((row, index) => (
          <div key={index} className="flex flex-row py-3 border-b border-border">
            <Text className="flex-[2] text-text text-center text-xs">{row.date}</Text>
            <Text className="flex-1 text-text text-center text-xs">{row.sets}</Text>
            <Text className="flex-1 text-text text-center text-xs">{row.maxReps}</Text>
            <Text className="flex-1 text-text text-center text-xs">{row.maxIntensity || '-'}</Text>
            <Text className="flex-1 text-text text-center text-xs">{row.totalVolume || '-'}</Text>
          </div>
        ))}
      </div>
    </div>
  );
};
