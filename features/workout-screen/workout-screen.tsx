'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Text, ActivityIndicator, View, Button } from '@/lib/ui/components';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ExerciseCard } from '@/features/workout-screen/components/exercise-card';
import { WorkoutSummaryModal } from '@/features/workout-screen/components/workout-summary-modal';
import { isNotNull } from '@/shared/utils/array';
import { PerformanceLog, PerformanceLogs } from '@/shared/models/exercise';
import { Id } from '@/convex/_generated/dataModel';

export default function WorkoutScreen() {
  const history = useHistory();
  const params = useParams<{ phase: string; day: string }>();
  const phase = params.phase || '1';
  const day = params.day || '1';

  const [performanceLog, setPerformanceLog] = useState<PerformanceLogs>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<{ name?: string; summary?: string }[]>([]);

  const templates = useQuery(api.workouts.get_all_workout_templates);
  const lastWorkout = useQuery(api.workouts.get_last_workout_log, { phase: parseInt(phase), day: parseInt(day) });
  const logWorkout = useMutation(api.workouts.log_workout);

  const exercisesForDay = useMemo(() => {
    if (!templates) return [];
    return templates.filter(e => e.phase === parseInt(phase) && e.day === parseInt(day));
  }, [templates, phase, day]);

  useEffect(() => {
    if (exercisesForDay.length > 0) {
      const initialLog: PerformanceLogs = {};
      exercisesForDay.forEach(ex => {
        const exerciseName = ex.exercise?.exerciseName || ex.exerciseName || '';
        const lastPerf = lastWorkout?.performance.find(p => p.exerciseName === exerciseName);
        initialLog[ex._id] = {
          exerciseName: exerciseName,
          sets: lastPerf?.sets.map(s => ({ ...s, completed: false })) || 
            Array.from({ length: ex.targetSets }, () => ({ reps: '', intensity: '', completed: false })),
          notes: '',
          exerciseId: ex._id,
          lastPerformance: lastPerf ? {...lastPerf, exerciseId: ex._id} : undefined,
        };
      });
      setPerformanceLog(initialLog);
    }
  }, [exercisesForDay, lastWorkout]);

  const handleUpdateExercise = (exerciseId: Id<'workoutTemplates'>, data: PerformanceLog) => {
    setPerformanceLog(prev => ({ ...prev, [exerciseId]: data }));
  };

  const handleFinishPress = () => {
    const summary = Object.values(performanceLog).map(p => {
      if (!p.sets || p.sets.length === 0) return null;
      const setsCount = p.sets.length;
      const avgReps = (p.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0) / setsCount).toFixed(1);
      const volumeReps = p.sets.reduce((sum, s) => sum + (parseInt(s.reps, 10) || 0), 0);
      const setIntensity = p.sets.find((s) => s.intensity)?.intensity;
      return {
        name: p.exerciseName,
        summary: `${setsCount} sets, avg ${avgReps} reps @ ${setIntensity}, volume ${volumeReps}`,
      };
    }).filter(isNotNull);

    setWorkoutSummary(summary);
    setIsSummaryVisible(true);
  };

  const confirmAndSaveWorkout = async () => {
    setIsSaving(true);
    const finalLog = {
      date: new Date().toISOString(),
      day: parseInt(day),
      phase: parseInt(phase),
      performance: Object.values(performanceLog)
        .map(p => ({
          exerciseName: p.exerciseName,
          notes: p.notes || '',
          sets: p.sets
            .filter((s) => s.reps && s.reps.trim() !== '')
            .map(s => ({
              reps: s.reps.trim(),
              intensity: s.intensity.trim()
            }))
        }))
        .filter(p => p.sets.length > 0)
    };
    try {
      await logWorkout(finalLog);
      setIsSummaryVisible(false);
      history.push('/');
    } catch (error) {
      alert('Could not save workout.');
      console.error('Error saving workout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (templates === undefined || lastWorkout === undefined) {
    return (
      <View className="min-h-screen flex items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <div className="screen-container w-full">
      <div className="flex flex-row justify-end px-5 py-4 mb-4">
        <Button
          variant="primary"
          onClick={handleFinishPress}
          disabled={isSaving}
          className="px-5 py-2 rounded-full"
        >
          Finish
        </Button>
      </div>

      <WorkoutSummaryModal
        onConfirm={confirmAndSaveWorkout}
        isVisible={isSummaryVisible}
        workoutSummary={workoutSummary}
        onClose={() => setIsSummaryVisible(false)}
        isSaving={isSaving}
      />

      <View className="pb-24">
        {exercisesForDay.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Text className="text-subtle-text">No exercises found for this workout.</Text>
          </div>
        ) : (
          exercisesForDay.map(ex => {
            const exerciseName = ex.exercise?.exerciseName || ex.exerciseName || '';
            const performanceData = performanceLog[ex._id] || {
              exerciseName: exerciseName,
              sets: Array.from({ length: ex.targetSets || 3 }, () => ({ reps: '', intensity: '', completed: false })),
              notes: '',
              exerciseId: ex._id,
              lastPerformance: lastWorkout?.performance.find(p => p.exerciseName === exerciseName) 
                ? {...lastWorkout.performance.find(p => p.exerciseName === exerciseName)!, exerciseId: ex._id}
                : undefined,
            };
            return (
              <ExerciseCard
                key={ex._id}
                exercise={{ ...ex, exerciseName }}
                performanceData={performanceData}
                onUpdate={handleUpdateExercise}
              />
            );
          })
        )}
      </View>
    </div>
  );
}
