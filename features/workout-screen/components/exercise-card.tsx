'use client';

import { Id } from '@/convex/_generated/dataModel';
import { useCountdown } from '@/shared/hooks/use-countdown';
import { PerformanceLog } from '@/shared/models/exercise';
import React, { useMemo, useState } from 'react';
import { View, Text, Input, Textarea, TouchableOpacity, Card } from '@/lib/ui/components';
import { Dumbbell, Clock, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PreviousPerformanceModal } from './previous-performance-modal';

interface ExerciseCardProps {
  exercise: { _id: Id<'workoutTemplates'>; exerciseName: string; };
  onUpdate: (exerciseId: Id<'workoutTemplates'>, data: PerformanceLog) => void;
  performanceData: PerformanceLog;
  workoutLogs?: Array<{
    date: string;
    performance: Array<{
      exerciseName: string;
      sets: Array<{ reps: string; intensity: string }>;
      notes?: string;
    }>;
  }>;
}

const normalizeExerciseName = (name: string): string => {
  let normalized = name.toLowerCase().trim();
  if (normalized.length > 3 && normalized.endsWith('es')) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.length > 2 && normalized.endsWith('s')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

export const ExerciseCard = ({ exercise, onUpdate, performanceData, workoutLogs }: ExerciseCardProps) => {
  const setsToRender = performanceData?.sets || [];
  const lastPerformance = performanceData?.lastPerformance;
  const { start: startRest, isActive: isResting, formattedTime: restTime } = useCountdown(90, () => { });
  const [showPreviousModal, setShowPreviousModal] = useState(false);

  // Check if exercise has previous history
  const hasHistory = useMemo(() => {
    if (!workoutLogs || !exercise.exerciseName) return false;
    const normalizedName = normalizeExerciseName(exercise.exerciseName);
    return workoutLogs.some(log =>
      log.performance.some(p =>
        normalizeExerciseName(p.exerciseName) === normalizedName && p.sets.length > 0
      )
    );
  }, [workoutLogs, exercise.exerciseName]);

  const handleSetChange = (setIndex: number, field: string, value: string) => {
    const newSets = JSON.parse(JSON.stringify(setsToRender));
    newSets[setIndex][field] = value;
    onUpdate(exercise._id, {
      ...performanceData,
      sets: newSets
    });
  };

  const togglePB = (setIndex: number) => {
    const newSets = JSON.parse(JSON.stringify(setsToRender));
    newSets[setIndex].isPB = !newSets[setIndex].isPB;
    onUpdate(exercise._id, { ...performanceData, sets: newSets });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(exercise._id, { ...performanceData, notes: e.target.value });
  };

  const addSet = () => {
    const lastSet = setsToRender[setsToRender.length - 1];
    const newSet = lastSet 
      ? { reps: lastSet.reps, intensity: lastSet.intensity } 
      : { reps: '', intensity: '' };
    onUpdate(exercise._id, { ...performanceData, sets: [...setsToRender, newSet] });
  };

  const removeSet = (setIndex: number) => {
    if (setsToRender.length <= 1) return;
    const newSets = setsToRender.filter((_, index) => index !== setIndex);
    onUpdate(exercise._id, { ...performanceData, sets: newSets });
  };

  const prevSummary = useMemo(() => {
    if (!lastPerformance || lastPerformance.sets.length === 0) return null;
    const setsCount = lastPerformance.sets.length;
    const totalReps = lastPerformance.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0);
    const setIntensity = lastPerformance.sets.find((s) => s.intensity)?.intensity;
    const totalVolume = lastPerformance.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0);
    const avgReps = (totalReps / setsCount).toFixed(1);
    return {
      summary: `${setsCount} sets, avg ${avgReps} reps @ ${setIntensity}, volume ${totalVolume}`,
      notes: lastPerformance.notes
    };
  }, [lastPerformance]);

  return (
    <>
      <Card className="mx-4 mb-0 p-4">
        <View className="flex flex-row items-center mb-2 gap-3">
          <Dumbbell className="w-4.5 h-4.5 text-primary flex-shrink-0" />
          <Text variant="h3" className="text-xl font-bold flex-1">
            {exercise.exerciseName}
          </Text>
          {hasHistory && (
            <button
              onClick={() => setShowPreviousModal(true)}
              className="w-8 h-8 flex items-center justify-center hover:bg-primary/20 rounded-lg transition-colors"
              title="View previous performance"
            >
              <Info className="w-4 h-4 text-primary" />
            </button>
          )}
        </View>

      {prevSummary && (
        <div className="bg-background rounded-lg p-2.5 mb-3">
          <Text className="text-subtle-text text-sm italic">{prevSummary.summary}</Text>
          {prevSummary.notes && (
            <Text className="text-subtle-text text-sm italic mt-1">Notes: {prevSummary.notes}</Text>
          )}
        </div>
      )}

      <button
        onClick={startRest}
        className="flex flex-row items-center mb-4 self-start"
      >
        <Clock className={cn('w-3.5 h-3.5', isResting ? 'text-primary' : 'text-subtle-text')} />
        <Text className={cn('ml-2 text-sm font-medium', isResting ? 'text-primary' : 'text-subtle-text')}>
          {isResting ? restTime : 'Start Rest (1m 30s)'}
        </Text>
      </button>

      <View className="flex flex-row pb-2 mb-2 border-b border-border">
        <Text className="text-placeholder text-xs font-semibold flex-[1.5]">SET</Text>
        <Text className="text-placeholder text-xs font-semibold flex-[1.5]">INTENSITY</Text>
        <Text className="text-placeholder text-xs font-semibold flex-[1.5]">REPS</Text>
        <Text className="text-placeholder text-xs font-semibold w-[60px] text-center">PB</Text>
        <div className="w-[50px]" />
      </View>

      <div className="space-y-1">
        {setsToRender.map((set, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-row items-center py-1 border-b border-border gap-1',
              set.isPB && 'bg-primary/10 border-primary/40'
            )}
          >
            <Text className="text-base flex-[0.5] text-center">
              {index + 1}
            </Text>
            <Input
              type="text"
              value={set.intensity || ''}
              onChange={(e) => handleSetChange(index, 'intensity', e.target.value)}
              className="flex-1 text-center"
            />
            <Input
              type="number"
              value={set.reps || ''}
              onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
              className="flex-1 text-center"
            />
            <button
              onClick={() => togglePB(index)}
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-xs font-bold',
                set.isPB ? 'bg-primary text-white' : 'hover:bg-card/50 text-subtle-text'
              )}
              title="Mark as Personal Best"
            >
              {set.isPB ? 'PB' : 'PB'}
            </button>
            {setsToRender.length > 1 && (
              <button
                onClick={() => removeSet(index)}
                className="w-10 h-10 flex items-center justify-center hover:bg-error/10 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-error" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addSet}
        className="bg-primary/10 rounded-lg py-3 mt-4 text-center hover:bg-primary/20 transition-colors"
      >
        <Text className="text-primary text-base font-bold">+ Add Set</Text>
      </button>

      <Textarea
        placeholder="Add workout notes..."
        value={performanceData?.notes || ''}
        onChange={handleNotesChange}
        rows={3}
        className="mt-4"
      />
    </Card>

    <PreviousPerformanceModal
      isVisible={showPreviousModal}
      onClose={() => setShowPreviousModal(false)}
      exerciseName={exercise.exerciseName}
      workoutLogs={workoutLogs}
    />
    </>
  );
};
