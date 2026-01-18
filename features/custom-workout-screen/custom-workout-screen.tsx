'use client';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { WorkoutSummaryModal } from '@/features/workout-screen/components/workout-summary-modal';
import { ActivityIndicator, Button, Text, View } from '@/lib/ui/components';
import { PerformanceLog, PerformanceLogs } from '@/shared/models/exercise';
import { isNotNull } from '@/shared/utils/array';
import { useAction, useMutation } from 'convex/react';
import { Camera, Image, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { WodCard } from '../workout-screen/components/wod-card';
import { NewExerciseCard } from './components/new-exercise-card';

type SCAN_TYPE = 'gallery' | 'camera';

export default function CustomWorkoutScreen() {
  const history = useHistory();
  const phase = '0';
  const day = '0';

  const [performanceLog, setPerformanceLog] = useState<PerformanceLogs>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<{ name?: string; summary?: string }[]>([]);
  const [templates, setTemplates] = useState<{ _id: Id<'workoutTemplates'>; exerciseName: string }[]>([]);
  const [wodBlocks, setWodBlocks] = useState<any[]>([]);

  const logWorkout = useMutation(api.workouts.log_workout);
  const createCustomExercise = useMutation(api.workouts.create_custom_workout);
  const exercisesForDay = useMemo(() => templates || [], [templates]);
  const scanImage = useAction(api.ai.scan_workout_image);

  const handleGetWodImage = async (type: SCAN_TYPE): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      if (type === 'camera') {
        input.capture = 'environment';
      }
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
          resolve(base64Data);
        };
        reader.readAsDataURL(file);
      };
      
      input.click();
    });
  };

  const handleScanWOD = async (type: SCAN_TYPE) => {
    setIsScanning(true);
    try {
      const base64Image = await handleGetWodImage(type);
      if (!base64Image) {
        setIsScanning(false);
        return;
      }

      const parsedData = await scanImage({ base64Image });
      setWodBlocks(parsedData);

      const allExercises: any[] = [];
      parsedData.forEach((block: any) => {
        block.exercises.forEach((name: string) => {
          allExercises.push({
            _id: `ex-${uuidv4()}` as Id<'workoutTemplates'>,
            exerciseName: name,
            parentWod: block.title,
          });
        });
      });

      setTemplates(prev => [...prev, ...allExercises]);
    } catch (error) {
      console.error(error);
      alert('AI could not structure the CrossFit workout.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateExercise = (exerciseId: Id<'workoutTemplates'>, data: PerformanceLog) => {
    const exercise = templates.find((t) => t._id === exerciseId);
    setPerformanceLog(prev => ({
      ...prev,
      [exerciseId]: {
        ...data,
        exerciseName: data?.exerciseName || exercise?.exerciseName || ''
      }
    }));
    setTemplates(prev => prev.map(t => t._id === exerciseId ? {
      ...t,
      exerciseName: data?.exerciseName || exercise?.exerciseName || ''
    } : t));
  };

  const handleDeleteExercise = (exerciseId: Id<'workoutTemplates'>) => {
    setPerformanceLog(prev => {
      const newLog = { ...prev };
      delete newLog[exerciseId];
      return newLog;
    });
    setTemplates(prev => prev.filter(ex => ex._id !== exerciseId));
  };

  const handleCreateNewExercise = () => {
    const newExId = `ex-${uuidv4()}` as Id<'workoutTemplates'>;
    setTemplates(prev => ([...prev, { _id: newExId, exerciseName: '' }]));
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
      day: parseInt(day || '0'),
      phase: parseInt(phase || '0'),
      performance: Object.values(performanceLog)
        .map(p => ({
          exerciseName: p.exerciseName,
          notes: p.notes || '',
          sets: p.sets
            .filter((s) => s.reps && s.reps.trim() !== '')
            .map(s => ({ reps: s.reps.trim(), intensity: s.intensity.trim() }))
        }))
        .filter(p => p.sets.length > 0)
    };
    try {
      for (const ex of exercisesForDay) {
        await createCustomExercise({
          exerciseName: ex.exerciseName,
          phase: 0,
          day: 0,
          targetReps: '8',
          targetSets: 3,
          targetIntensity: 'Medium',
          letter: '',
          tempo: '2-0-2',
          rest: '60s',
        });
      }
      await logWorkout(finalLog);
      setIsSummaryVisible(false);
      history.push('/');
    } catch (error) {
      alert('Could not save workout.');
    } finally {
      setIsSaving(false);
    }
  };

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
        withMuscleMap={false}
      />

      <View className="px-0 pb-5">
        <div className="flex flex-row gap-2 mb-5 border-b border-border pb-5 flex-wrap w-full ">
          <Button
            variant="secondary"
            onClick={() => handleScanWOD('camera')}
            disabled={isScanning}
            className="flex-1 flex flex-row items-center justify-center gap-2 w-fit"
          >
            {isScanning ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <Text className="font-bold text-nowrap">Scan WOD Board</Text>
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleScanWOD('gallery')}
            disabled={isScanning}
            className="flex-1 flex flex-row items-center justify-center gap-2 w-fit"
          >
            {isScanning ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <Image className="w-4 h-4" />
                <Text className="font-bold text-nowrap">WOD from gallery</Text>
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-2">

        {wodBlocks.map((block, idx) => (
          <WodCard
            key={idx}
            title={block.title}
            timeCap={block.timeCap}
            repScheme={block.repScheme}
            exercises={block.exercises}
          />
        ))}

        </div>
        <Text className="text-center my-4 text-text text-lg font-extrabold uppercase">
          Log Performance
        </Text>

        <div className="flex flex-col gap-2">
        {exercisesForDay.length === 0 ? (
          <div className="px-0 py-10 text-center">
            <Text className="text-subtle-text">No exercises yet. Add exercises or scan a WOD to get started.</Text>
          </div>
        ) : (
          exercisesForDay.map(ex => {
            const performanceData = performanceLog[ex._id] || {
              sets: [{ reps: '', intensity: '', completed: false }],
              exerciseName: ex.exerciseName || '',
              exerciseId: ex._id
            };
            return (
              <NewExerciseCard
                key={ex._id}
                exercise={ex}
                performanceData={performanceData}
                onUpdate={handleUpdateExercise}
                onDelete={handleDeleteExercise}
              />
            );
          })
        )}
    </div>

        <Button
          variant="primary"
          onClick={handleCreateNewExercise}
          className="mx-5 mt-5 py-4 rounded-xl flex flex-row items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <Text className="font-bold">Create new exercise</Text>
        </Button>
      </View>
    </div>
  );
}
