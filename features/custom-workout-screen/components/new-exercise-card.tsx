'use client';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, Input, Text, Textarea, View } from '@/lib/ui/components';
import { cn } from '@/lib/utils';
import { useCountdown } from '@/shared/hooks/use-countdown';
import { PerformanceLog } from '@/shared/models/exercise';
import { useQuery } from 'convex/react';
import { Check, Clock, Dumbbell, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const normalizeExerciseName = (name: string): string => {
  let normalized = name.toLowerCase().trim();
  if (normalized.length > 3 && normalized.endsWith('es')) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.length > 2 && normalized.endsWith('s')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

interface NewExerciseCardProps {
  exercise: { _id: Id<'workoutTemplates'>; exerciseName: string; };
  onUpdate: (exerciseId: Id<'workoutTemplates'>, data: PerformanceLog) => void;
  onDelete: (exerciseId: Id<'workoutTemplates'>) => void;
  performanceData: PerformanceLog;
}

export const NewExerciseCard = ({ exercise, onUpdate, performanceData, onDelete }: NewExerciseCardProps) => {
  const setsToRender = performanceData?.sets || [];
  const lastPerformance = performanceData?.lastPerformance;
  const { start: startRest, isActive: isResting, formattedTime: restTime } = useCountdown(90, () => { });
  
  const customExercises = useQuery(api.workouts.get_all_custom_workout_templates);
  const [exerciseNameInput, setExerciseNameInput] = useState(performanceData?.exerciseName || exercise.exerciseName);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const uniqueCustomExerciseNames = useMemo(() => {
    if (!customExercises) return [];
    const normalizedMap = new Map<string, string>();
    customExercises.forEach(ex => {
      if (ex.exercise?.exerciseName) {
        const normalizedKey = normalizeExerciseName(ex.exercise.exerciseName);
        if (!normalizedMap.has(normalizedKey)) {
          normalizedMap.set(normalizedKey, ex.exercise.exerciseName);
        }
      }
    });
    return Array.from(normalizedMap.values()).sort();
  }, [customExercises]);

  const filteredExercises = useMemo(() => {
    if (!exerciseNameInput.trim()) return [];
    const lowerInput = exerciseNameInput.toLowerCase();
    return uniqueCustomExerciseNames.filter(name => 
      name.toLowerCase().includes(lowerInput) && 
      name.toLowerCase() !== lowerInput
    ).slice(0, 5);
  }, [exerciseNameInput, uniqueCustomExerciseNames]);

  useEffect(() => {
    const currentName = performanceData?.exerciseName || exercise.exerciseName;
    if (currentName !== exerciseNameInput) {
      setExerciseNameInput(currentName);
    }
  }, [performanceData?.exerciseName, exercise.exerciseName]);

  const handleExerciseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExerciseNameInput(value);
    setShowDropdown(value.trim().length > 0 && filteredExercises.length > 0);
    onUpdate(exercise._id, {
      ...performanceData,
      exerciseName: value
    });
  };

  const handleSelectExercise = (selectedName: string) => {
    setExerciseNameInput(selectedName);
    setShowDropdown(false);
    inputRef.current?.blur();
    onUpdate(exercise._id, {
      ...performanceData,
      exerciseName: selectedName
    });
  };

  const handleInputFocus = () => {
    if (exerciseNameInput.trim().length > 0 && filteredExercises.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleSetChange = (setIndex: number, field: string, value: string) => {
    const newSets = JSON.parse(JSON.stringify(setsToRender));
    newSets[setIndex][field] = value;
    onUpdate(exercise._id, {
      ...performanceData,
      sets: newSets
    });
  };

  const toggleSetComplete = (setIndex: number) => {
    const newSets = JSON.parse(JSON.stringify(setsToRender));
    newSets[setIndex].completed = !newSets[setIndex].completed;
    if (newSets[setIndex].completed) startRest();
    onUpdate(exercise._id, { ...performanceData, sets: newSets });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(exercise._id, { ...performanceData, notes: e.target.value });
  };

  const addSet = () => {
    const lastSet = setsToRender[setsToRender.length - 1];
    const newSet = lastSet 
      ? { reps: lastSet.reps, intensity: lastSet.intensity, completed: false } 
      : { reps: '', intensity: '', completed: false };
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
    <Card className="p-4 mb-0">
      <View className="flex flex-row items-start mb-2 gap-3 relative z-10">
        <Dumbbell className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-2" />
        <div className="flex-1 relative" ref={containerRef}>
          <Input
            ref={inputRef}
            type="text"
            value={exerciseNameInput}
            onChange={handleExerciseNameChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Exercise name"
            className="text-xl font-bold w-full"
          />
          {showDropdown && filteredExercises.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background rounded-lg border border-border max-h-[180px] overflow-auto z-[10001] shadow-lg">
              {filteredExercises.map((item, index) => (
                <button
                  key={item}
                  onClick={() => handleSelectExercise(item)}
                  className={cn(
                    'w-full px-4 py-3.5 text-left hover:bg-card transition-colors',
                    index !== filteredExercises.length - 1 && 'border-b border-border'
                  )}
                >
                  <Text className="text-base font-medium">{item}</Text>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(exercise._id)}
          className="w-10 h-10 flex items-center justify-center hover:bg-error/10 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-error" />
        </button>
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
        className="flex flex-row items-center mb-4 self-start z-0"
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
        <div className="w-[50px]" />
      </View>

      <div className="space-y-1">
        {setsToRender.map((set, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-row items-center py-1 border-b border-border gap-1',
              set.completed && 'bg-success/10 border-success/40 border rounded-lg -mx-4 px-4'
            )}
          >
            <Text className={cn('text-base flex-[0.5] text-center', set.completed && 'text-success')}>
              {index + 1}
            </Text>
            <Input
              type="text"
              value={set.intensity || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSetChange(index, 'intensity', e.target.value)}
              className="flex-1 text-center"
            />
            <Input
              type="number"
              value={set.reps || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSetChange(index, 'reps', e.target.value)}
              className="flex-1 text-center"
            />
            <button
              onClick={() => toggleSetComplete(index)}
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
                set.completed ? 'bg-success' : 'hover:bg-card/50'
              )}
            >
              <Check className={cn('w-4 h-4', set.completed ? 'text-white' : 'text-subtle-text')} />
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
  );
};
