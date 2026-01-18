'use client';

import React from 'react';
import { View, Text, Card } from '@/lib/ui/components';
import { Clock } from 'lucide-react';

interface WodCardProps {
  title: string;
  timeCap?: string;
  repScheme?: string;
  exercises: string[];
}

export const WodCard = ({ title, timeCap, repScheme, exercises }: WodCardProps) => {
  return (
    <Card className="mx-4 my-2.5 p-4 shadow-lg">
      <div className="flex flex-row justify-between items-start mb-3">
        <div>
          <Text variant="h3" className="text-lg font-extrabold uppercase">
            {title}
          </Text>
          {repScheme && (
            <Text className="text-primary text-base font-bold mt-0.5 font-mono">
              {repScheme}
            </Text>
          )}
        </div>
        {timeCap && (
          <div className="bg-error/20 px-2.5 py-1 rounded-lg border border-error">
            <Text className="text-error font-bold text-xs">⏱ {timeCap}</Text>
          </div>
        )}
      </div>
      
      <div className="border-t border-border pt-3 space-y-1">
        {exercises.map((ex, i) => (
          <div key={i} className="my-1">
            <Text className="text-text text-[15px] opacity-90">• {ex}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
};
