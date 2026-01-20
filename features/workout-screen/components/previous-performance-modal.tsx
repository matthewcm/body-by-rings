'use client';

import { Modal, ScrollView, Text, View, Card } from '@/lib/ui/components';
import { Info, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { useMemo } from 'react';
import { findBest1RM } from '@/shared/utils/one-rm-calculator';

interface PreviousPerformanceModalProps {
  isVisible: boolean;
  onClose: () => void;
  exerciseName: string;
  workoutLogs: Array<{
    date: string;
    performance: Array<{
      exerciseName: string;
      sets: Array<{ reps: string; intensity: string }>;
      notes?: string;
    }>;
  }> | undefined;
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

export const PreviousPerformanceModal = ({
  isVisible,
  onClose,
  exerciseName,
  workoutLogs,
}: PreviousPerformanceModalProps) => {
  const exerciseHistory = useMemo(() => {
    if (!workoutLogs || !exerciseName) return [];
    
    const normalizedName = normalizeExerciseName(exerciseName);
    
    return workoutLogs
      .map(log => {
        const performance = log.performance.find(p =>
          normalizeExerciseName(p.exerciseName) === normalizedName
        );
        if (!performance || performance.sets.length === 0) return null;
        
        return {
          date: log.date,
          performance,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workoutLogs, exerciseName]);

  const bestEfforts = useMemo(() => {
    if (exerciseHistory.length === 0) return null;
    
    const allSets = exerciseHistory.flatMap(h => h.performance.sets);
    
    // Best 1RM
    const best1RM = findBest1RM(allSets);
    
    // Best reps (max reps in a single set)
    const bestReps = Math.max(
      ...allSets.map(s => parseInt(s.reps, 10) || 0)
    );
    
    // Best intensity (max weight/intensity)
    const bestIntensity = Math.max(
      ...allSets.map(s => parseFloat(s.intensity) || 0)
    );
    
    // Best volume (total reps in a workout)
    const bestVolume = Math.max(
      ...exerciseHistory.map(h => 
        h.performance.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0)
      )
    );
    
    // Most recent performance
    const mostRecent = exerciseHistory[0];
    
    return {
      best1RM,
      bestReps,
      bestIntensity: bestIntensity > 0 ? bestIntensity : null,
      bestVolume,
      mostRecent,
      totalWorkouts: exerciseHistory.length,
    };
  }, [exerciseHistory]);

  if (!bestEfforts) {
    return (
      <Modal visible={isVisible} onClose={onClose} className="max-w-md">
        <div className="p-6">
          <div className="flex flex-row items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-primary" />
            <Text variant="h3" className="text-lg font-bold">
              Previous Performance
            </Text>
          </div>
          <Text className="text-subtle-text text-center py-4">
            No previous records found for {exerciseName}
          </Text>
        </div>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} onClose={onClose} className="max-w-2xl w-[90%] max-h-[90vh]">
      <div className="p-5 flex flex-col max-h-[90vh]">
        <div className="flex flex-row items-center gap-3 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <Text variant="h3" className="text-lg font-bold">
            {exerciseName} - Performance History
          </Text>
        </div>

        <ScrollView className="flex-1 overflow-auto w-full">
          {/* Best Efforts Summary */}
          <Card className="p-4 mb-4 bg-primary/10 border-primary/20">
            <Text variant="h3" className="text-base font-bold mb-3 flex flex-row items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Best Efforts
            </Text>
            <div className="grid grid-cols-2 gap-3">
              {bestEfforts.best1RM && (
                <div>
                  <Text className="text-xs text-subtle-text">Estimated 1RM</Text>
                  <Text className="text-lg font-bold text-primary">
                    {bestEfforts.best1RM.toFixed(1)}
                  </Text>
                </div>
              )}
              <div>
                <Text className="text-xs text-subtle-text">Best Reps (Single Set)</Text>
                <Text className="text-lg font-bold text-primary">
                  {bestEfforts.bestReps}
                </Text>
              </div>
              {bestEfforts.bestIntensity && (
                <div>
                  <Text className="text-xs text-subtle-text">Best Intensity</Text>
                  <Text className="text-lg font-bold text-primary">
                    {bestEfforts.bestIntensity.toFixed(1)}
                  </Text>
                </div>
              )}
              <div>
                <Text className="text-xs text-subtle-text">Best Volume (Total Reps)</Text>
                <Text className="text-lg font-bold text-primary">
                  {bestEfforts.bestVolume}
                </Text>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <Text className="text-xs text-subtle-text">
                Total workouts: {bestEfforts.totalWorkouts}
              </Text>
            </div>
          </Card>

          {/* Most Recent Performance */}
          {bestEfforts.mostRecent && (
            <Card className="p-4 mb-4">
              <Text variant="h3" className="text-base font-bold mb-3 flex flex-row items-center gap-2">
                <Calendar className="w-4 h-4" />
                Most Recent ({new Date(bestEfforts.mostRecent.date).toLocaleDateString()})
              </Text>
              <div className="space-y-2">
                <div className="flex flex-row justify-between">
                  <Text className="text-sm text-subtle-text">Sets:</Text>
                  <Text className="text-sm font-semibold">
                    {bestEfforts.mostRecent.performance.sets.length}
                  </Text>
                </div>
                <div className="flex flex-row justify-between">
                  <Text className="text-sm text-subtle-text">Total Volume:</Text>
                  <Text className="text-sm font-semibold">
                    {bestEfforts.mostRecent.performance.sets.reduce(
                      (sum, s) => sum + (parseInt(s.reps, 10) || 0),
                      0
                    )} reps
                  </Text>
                </div>
                {bestEfforts.mostRecent.performance.notes && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <Text className="text-xs text-subtle-text italic">
                      Notes: {bestEfforts.mostRecent.performance.notes}
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Recent History */}
          {exerciseHistory.length > 1 && (
            <div>
              <Text variant="h3" className="text-base font-bold mb-3">
                Recent History
              </Text>
              <div className="space-y-2">
                {exerciseHistory.slice(0, 5).map((entry, idx) => {
                  const totalReps = entry.performance.sets.reduce(
                    (sum, s) => sum + (parseInt(s.reps, 10) || 0),
                    0
                  );
                  const maxReps = Math.max(
                    ...entry.performance.sets.map(s => parseInt(s.reps, 10) || 0)
                  );
                  
                  return (
                    <Card key={idx} className="p-3">
                      <div className="flex flex-row justify-between items-start">
                        <div>
                          <Text className="text-sm font-semibold">
                            {new Date(entry.date).toLocaleDateString()}
                          </Text>
                          <Text className="text-xs text-subtle-text">
                            {entry.performance.sets.length} sets • {totalReps} total reps • Max: {maxReps} reps
                          </Text>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollView>
      </div>
    </Modal>
  );
};
