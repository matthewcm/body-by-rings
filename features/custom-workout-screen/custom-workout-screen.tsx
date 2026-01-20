'use client';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { WorkoutSummaryModal } from '@/features/workout-screen/components/workout-summary-modal';
import { Button, Text, View } from '@/lib/ui/components';
import { PerformanceLog, PerformanceLogs } from '@/shared/models/exercise';
import { isNotNull } from '@/shared/utils/array';
import { useAction, useMutation, useQuery } from 'convex/react';
import { Plus } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { WodCard } from '../workout-screen/components/wod-card';
import { NewExerciseCard } from './components/new-exercise-card';
import { createSetsFromRepScheme } from './components/rep-scheme-parser';
import { ScanType, handleGetWodImage } from './components/wod-image-handler';
import { WodScannerButtons } from './components/wod-scanner-buttons';

export default function CustomWorkoutScreen() {
  const history = useHistory();
  const phase = '0';
  const day = '0';

  const [performanceLog, setPerformanceLog] = useState<PerformanceLogs>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningType, setScanningType] = useState<ScanType | null>(null);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<{ name?: string; summary?: string }[]>([]);
  const [templates, setTemplates] = useState<{ 
    _id: Id<'workoutTemplates'>; 
    exerciseName: string;
    repScheme?: string | null;
    parentWod?: string;
  }[]>([]);
  const [wodBlocks, setWodBlocks] = useState<any[]>([]);
  
  // Ref to track if scan should be cancelled
  const scanCancelledRef = useRef(false);

  const logWorkout = useMutation(api.workouts.log_workout);
  const createCustomExercise = useMutation(api.workouts.create_custom_workout);
  const exercisesForDay = useMemo(() => templates || [], [templates]);
  const scanImage = useAction(api.ai.scan_workout_image);
  const workoutLogs = useQuery(api.workouts.get_workout_logs);

  const handleScanWOD = async (type: ScanType) => {
    setIsScanning(true);
    setScanningType(type);
    scanCancelledRef.current = false;
    
    try {
      const result = await handleGetWodImage(type);
      
      // Check if cancelled
      if (result.cancelled || scanCancelledRef.current) {
        setIsScanning(false);
        setScanningType(null);
        return;
      }
      
      if (!result.base64Image) {
        setIsScanning(false);
        setScanningType(null);
        return;
      }

      // Check again before making API call
      if (scanCancelledRef.current) {
        setIsScanning(false);
        setScanningType(null);
        return;
      }

      const parsedData = await scanImage({ base64Image: result.base64Image });
      
      // Final check before updating state
      if (scanCancelledRef.current) {
        setIsScanning(false);
        setScanningType(null);
        return;
      }

      setWodBlocks(parsedData);

      const allExercises: { 
        _id: Id<'workoutTemplates'>; 
        exerciseName: string; 
        repScheme?: string | null;
        parentWod?: string;
      }[] = [];
      const newPerformanceLogs: PerformanceLogs = {};
      
      parsedData.forEach((block: any) => {
        block.exercises.forEach((name: string) => {
          const exerciseId = `ex-${uuidv4()}` as Id<'workoutTemplates'>;
          const repScheme = block.repScheme || null;
          
          allExercises.push({
            _id: exerciseId,
            exerciseName: name,
            repScheme: repScheme,
            parentWod: block.title,
          });

          // Auto-fill performance log with sets from rep scheme if available
          const initialSets = createSetsFromRepScheme(repScheme);
          newPerformanceLogs[exerciseId] = {
            exerciseId: exerciseId,
            exerciseName: name,
            sets: initialSets,
            notes: '',
          };
        });
      });

      setTemplates(prev => [...prev, ...allExercises]);
      // Auto-populate performance logs with rep scheme data
      setPerformanceLog(prev => ({ ...prev, ...newPerformanceLogs }));
    } catch (error) {
      if (!scanCancelledRef.current) {
        console.error(error);
        alert('AI could not structure the CrossFit workout.');
      }
    } finally {
      setIsScanning(false);
      setScanningType(null);
      scanCancelledRef.current = false;
    }
  };

  const handleCancelScan = () => {
    scanCancelledRef.current = true;
    setIsScanning(false);
    setScanningType(null);
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
        <WodScannerButtons
          onScan={handleScanWOD}
          onCancel={handleCancelScan}
          isScanning={isScanning}
          scanningType={scanningType}
        />

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
              sets: [{ reps: '', intensity: '' }],
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
                workoutLogs={workoutLogs}
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
