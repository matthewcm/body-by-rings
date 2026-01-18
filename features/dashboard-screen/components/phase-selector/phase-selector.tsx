'use client';

import { View, Text, TouchableOpacity } from '@/lib/ui/components';
import { cn } from '@/lib/utils';

interface PhaseSelectorProps {
  selectedPhase: number;
  onPhaseChange: (phase: number) => void;
  phases: number[];
}

export const PhaseSelector = ({ selectedPhase, onPhaseChange, phases }: PhaseSelectorProps) => (
  <View className="flex flex-row justify-around bg-card rounded-xl p-1.5 mb-6">
    {phases.map(phase => (
      <TouchableOpacity
        key={phase}
        onClick={() => onPhaseChange(phase)}
        className={cn(
          'px-5 py-2.5 rounded-lg transition-colors',
          selectedPhase === phase
            ? 'bg-primary'
            : 'hover:bg-card/50'
        )}
      >
        <Text
          className={cn(
            'font-bold text-base',
            selectedPhase === phase
              ? 'text-background'
              : 'text-placeholder'
          )}
        >
          Phase {phase}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);


