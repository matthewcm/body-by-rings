'use client';

import { api } from '@/convex/_generated/api';
import { ProgressionTable } from '@/features/stats-screen/components/progression-table/progression-table';
import { ActivityIndicator, Button, Card, Input, Modal, Text, View } from '@/lib/ui/components';
import { cn } from '@/lib/utils';
import { THEME } from '@/shared/theme/colours';
import { generateHexShades } from '@/shared/utils/colors';
import { useMutation, useQuery } from 'convex/react';
import { Edit, Save, Search, Star, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Body, { type Muscle } from 'react-body-highlighter';

// Normalize exercise name: lowercase and remove pluralization
const normalizeExerciseName = (name: string): string => {
  let normalized = name.toLowerCase().trim();
  if (normalized.length > 3 && normalized.endsWith('es')) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.length > 2 && normalized.endsWith('s')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

export default function StatsScreen() {
  const logs = useQuery(api.workouts.get_workout_logs);
  const templates = useQuery(api.workouts.get_all_workout_templates);
  const customTemplates = useQuery(api.workouts.get_all_custom_workout_templates);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<Muscle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'standard' | 'custom'>('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const exerciseListRef = useRef<HTMLDivElement>(null);
  
  const updateExerciseName = useMutation(api.workouts.update_custom_exercise_name);
  const updateExerciseMuscles = useMutation(api.workouts.update_custom_exercise_muscles);

  console.log(selectedMuscles)
  
  // Organize muscles by body region
  const muscleGroups = useMemo(() => {
    return {
      'Upper Body': ['chest', 'front-deltoids', 'back-deltoids', 'triceps', 'biceps', 'upper-back', 'trapezius', 'forearm', ],
      'Core': ['abs', 'obliques', 'lower-back'],
      'Lower Body': ['quadriceps', 'hamstring', 'calves', 'gluteal', 'adductors', 'tibialis'],
      'Other': ['neck', 'head', 'ankles', 'knees'],
    };
  }, []);
  
  // Get the current custom exercise data when selected
  const currentCustomExercise = useMemo(() => {
    if (!customTemplates || !selectedExercise) return null;
    const template = customTemplates.find(ex => 
      ex.exercise?.exerciseName === selectedExercise || ex.exerciseName === selectedExercise
    );
    if (!template) return null;
    
    return {
      ...template,
      muscles: template.exercise?.muscles || [],
      exerciseId: template.exerciseId || null,
      exerciseName: template.exercise?.exerciseName || template.exerciseName || selectedExercise,
    };
  }, [customTemplates, selectedExercise]);

  const uniqueExercises = useMemo<string[]>(() => {
    if (!templates) return [];
    const names = templates
      .map(t => {
        const name = t.exercise?.exerciseName || t.exerciseName;
        return typeof name === 'string' ? name : null;
      })
      .filter((name): name is string => name !== null);
    return [...new Set(names)];
  }, [templates]);

  const uniqueCustomExercises = useMemo(() => {
    if (!customTemplates) return [];
    
    const normalizedMap = new Map<string, string>();
    customTemplates.forEach(t => {
      const exerciseName = t.exercise?.exerciseName || t.exerciseName;
      if (exerciseName) {
        const normalizedKey = normalizeExerciseName(exerciseName);
        if (!normalizedMap.has(normalizedKey)) {
          normalizedMap.set(normalizedKey, exerciseName);
        }
      }
    });
    return Array.from(normalizedMap.values()).sort();
  }, [customTemplates]);

  // Combined and filtered exercises
  type ExerciseItem = { name: string; type: 'standard' | 'custom' };
  const allExercises = useMemo<ExerciseItem[]>(() => {
    const standard: ExerciseItem[] = uniqueExercises.map(ex => ({ name: ex, type: 'standard' as const }));
    const custom: ExerciseItem[] = uniqueCustomExercises.map(ex => ({ name: ex, type: 'custom' as const }));
    return [...standard, ...custom].sort((a, b) => a.name.localeCompare(b.name));
  }, [uniqueExercises, uniqueCustomExercises]);

  // Filtered exercises based on search and filter
  const filteredExercises = useMemo<ExerciseItem[]>(() => {
    let filtered = allExercises;

    if (filterType !== 'all') {
      filtered = filtered.filter(ex => ex.type === filterType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allExercises, filterType, searchQuery]);

  // Group exercises by first letter
  const exercisesByLetter = useMemo(() => {
    const grouped: Record<string, ExerciseItem[]> = {};
    
    filteredExercises.forEach(ex => {
      const firstLetter = ex.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(ex);
    });

    Object.keys(grouped).forEach(letter => {
      grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [filteredExercises]);

  // Get available letters for index
  const availableLetters = useMemo(() => {
    return Object.keys(exercisesByLetter).sort();
  }, [exercisesByLetter]);

  useEffect(() => {
    if (selectedExercise && !allExercises.some(ex => ex.name === selectedExercise)) {
      if (allExercises.length > 0) {
        setSelectedExercise(allExercises[0].name);
      } else {
        setSelectedExercise('');
      }
    } else if (!selectedExercise && allExercises.length > 0) {
      setSelectedExercise(allExercises[0].name);
    }
  }, [allExercises, selectedExercise]);

  useEffect(() => {
    if (currentCustomExercise) {
      setEditingName(currentCustomExercise.exerciseName);
      setSelectedMuscles(currentCustomExercise.muscles || []);
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditingName('');
      setSelectedMuscles([]);
    }
  }, [currentCustomExercise]);

  const handleSaveExercise = async () => {
    if (!selectedExercise) return;
    
    try {
      if (editingName !== selectedExercise) {
        await updateExerciseName({ oldName: selectedExercise, newName: editingName });
        setSelectedExercise(editingName);
      }
      await updateExerciseMuscles({ exerciseName: editingName, muscles: selectedMuscles });
      setIsEditing(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 2000);
      console.error(error);
    }
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element && exerciseListRef.current) {
      const container = exerciseListRef.current;
      container.scrollTop = element.offsetTop - container.offsetTop;
    }
  };

  const tableData = useMemo(() => {
    if (!logs || !selectedExercise) return [];
    const normalizedSelectedExercise = normalizeExerciseName(selectedExercise);
    return logs
      .map(log => {
        const performance = log.performance.find(p => 
          normalizeExerciseName(p.exerciseName) === normalizedSelectedExercise
        );
        if (!performance || performance.sets.length === 0) return null;

        const numericSets = performance.sets.map(s => ({
          reps: parseInt(s.reps, 10) || 0,
          intensity: parseFloat(s.intensity) || 0,
        }));

        const maxReps = Math.max(...numericSets.map(s => s.reps));
        const maxIntensity = performance.sets.find(s => s.intensity)?.intensity;
        const totalVolume = numericSets.reduce((sum, s) => sum + s.reps, 0);

        return {
          date: new Date(log.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
          sets: performance.sets.length,
          maxReps,
          maxIntensity,
          totalVolume: Math.round(totalVolume),
          rawDate: new Date(log.date)
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [logs, selectedExercise]);

  if (logs === undefined || templates === undefined) {
    return (
      <View className="min-h-screen flex items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <div className="screen-container w-full">
      <View className="w-full flex flex-col">
        <Text variant="h1" className="text-3xl font-bold text-center mb-4">
          Progression
        </Text>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-10 pr-10"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-card/50 rounded"
            >
              <X className="w-3.5 h-3.5 text-placeholder" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-row gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'px-3 py-1.5 rounded-2xl border text-xs font-medium transition-colors',
              filterType === 'all'
                ? 'bg-primary border-primary text-background'
                : 'bg-card border-border text-text hover:bg-card/80'
            )}
          >
            All ({allExercises.length})
          </button>
          <button
            onClick={() => setFilterType('standard')}
            className={cn(
              'px-3 py-1.5 rounded-2xl border text-xs font-medium transition-colors',
              filterType === 'standard'
                ? 'bg-primary border-primary text-background'
                : 'bg-card border-border text-text hover:bg-card/80'
            )}
          >
            Standard ({uniqueExercises.length})
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={cn(
              'px-3 py-1.5 rounded-2xl border text-xs font-medium transition-colors',
              filterType === 'custom'
                ? 'bg-primary border-primary text-background'
                : 'bg-card border-border text-text hover:bg-card/80'
            )}
          >
            Custom ({uniqueCustomExercises.length})
          </button>
        </div>

        {/* Exercise List */}
        {filteredExercises.length > 0 ? (
          <div className="flex flex-col sm:flex-row mb-6 h-auto sm:h-[400px] border border-border rounded-xl overflow-hidden bg-card">
            {/* Alphabetical Index */}
            <div className="w-full sm:w-8 border-r-0 sm:border-r border-b sm:border-b-0 border-border bg-background flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-visible overflow-y-visible sm:overflow-y-auto">
              {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className={cn(
                    'py-1 px-2 text-center min-h-[28px] flex items-center justify-center transition-colors',
                    availableLetters.includes(letter)
                      ? 'bg-card text-primary font-semibold hover:bg-card/80'
                      : 'text-placeholder cursor-not-allowed'
                  )}
                  disabled={!availableLetters.includes(letter)}
                >
                  <Text className="text-xs">{letter}</Text>
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div
              ref={exerciseListRef}
              className="flex-1 overflow-y-auto p-3 w-full"
            >
              {availableLetters.map(letter => (
                <div key={letter} id={`letter-${letter}`} className="mb-4">
                  <Text className="text-lg font-bold text-primary mb-2 pl-1">
                    {letter}
                  </Text>
                  <div className="space-y-1.5">
                    {exercisesByLetter[letter].map((ex) => (
                      <button
                        key={`${ex.type}-${ex.name}`}
                        onClick={() => setSelectedExercise(ex.name)}
                        className={cn(
                          'w-full flex flex-row items-center justify-between px-3 py-2.5 rounded-lg border transition-colors',
                          selectedExercise === ex.name
                            ? 'bg-primary border-primary'
                            : 'bg-background border-border hover:bg-card/50'
                        )}
                      >
                        <Text className={cn(
                          'text-[15px] flex-1 text-left',
                          selectedExercise === ex.name ? 'text-background font-semibold' : 'text-text'
                        )}>
                          {ex.name}
                        </Text>
                        {ex.type === 'custom' && (
                          <Star className={cn(
                            'w-3 h-3 ml-2',
                            selectedExercise === ex.name ? 'text-background' : 'text-primary'
                          )} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="py-10 text-center mb-6">
            <Text className="text-base font-semibold text-text mb-1">
              No exercises found
            </Text>
            <Text className="text-sm text-subtle-text">
              Try adjusting your search or filter
            </Text>
          </Card>
        )}

        {selectedExercise && (
          <Card className="p-4">
            {currentCustomExercise ? (
              <>
                <div className="mb-4">
                  <div className="flex flex-row justify-between items-center mb-3">
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Exercise name"
                        className="flex-1 text-lg font-bold mr-2"
                      />
                    ) : (
                      <Text variant="h3" className="text-lg font-bold flex-1">
                        {selectedExercise}
                      </Text>
                    )}
                    {!isEditing && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="flex flex-row items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-2 justify-end w-full sm:w-auto">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingName(currentCustomExercise.exerciseName);
                          setSelectedMuscles(currentCustomExercise.muscles || []);
                        }}
                        className="flex flex-row items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveExercise}
                        className="flex flex-row items-center gap-1.5 bg-success hover:bg-success/90"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mb-5">
                    <Text variant="h3" className="text-lg font-semibold mb-4">
                      Muscles Worked
                    </Text>
                    <div className="space-y-4">
                      {Object.entries(muscleGroups).map(([groupName, muscles]) => (
                        <div key={groupName} className="mb-4">
                          <Text className="text-sm font-semibold text-subtle-text mb-2 uppercase tracking-wide">
                            {groupName}
                          </Text>
                          <div className="flex flex-row flex-wrap gap-1.5">
                            {muscles.map(muscle => (
                              <button
                                key={muscle}
                                onClick={() => toggleMuscle(muscle)}
                                className={cn(
                                  'px-2.5 py-1.5 rounded-xl border text-xs text-center min-w-[80px] transition-colors',
                                  selectedMuscles.includes(muscle)
                                    ? 'bg-primary border-primary text-background font-semibold'
                                    : 'bg-background border-border text-text hover:bg-card/50'
                                )}
                              >
                                {muscle.replace('-', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedMuscles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <Text className="text-sm italic text-subtle-text text-center">
                          {selectedMuscles.length} muscle{selectedMuscles.length !== 1 ? 's' : ''} selected
                        </Text>
                      </div>
                    )}
                  </div>
                )}

                {!isEditing && selectedMuscles.length > 0 && (
                  <div className="mb-5 flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-0 py-5 px-5 w-full">
                    <div className="flex-1 flex items-center justify-center w-full sm:w-auto">
                      <Body

                        data={[{ name: selectedExercise || 'Exercise', muscles: selectedMuscles }]}
                        type="anterior"
                        bodyColor="#dfdfdf"
                        highlightedColors={generateHexShades(THEME.primary, 6, 20)}
                        style={{ maxWidth: '200px', width: '100%' }}
                        svgStyle={{ width: '100%', height: 'auto' }}
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full sm:w-auto">
                      <Body
                        data={[{ name: selectedExercise || 'Exercise', muscles: selectedMuscles }]}
                        type="posterior"
                        bodyColor="#dfdfdf"
                        highlightedColors={generateHexShades(THEME.primary, 6, 20)}
                        style={{ maxWidth: '200px', width: '100%' }}
                        svgStyle={{ width: '100%', height: 'auto' }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Text variant="h3" className="text-lg font-bold mb-4">
                {selectedExercise}
              </Text>
            )}
            <ProgressionTable data={tableData} />
          </Card>
        )}

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          className="max-w-sm"
        >
          <div className="p-6 text-center">
            <Text variant="h3" className="text-lg font-bold mb-2 text-success">
              Success!
            </Text>
            <Text className="text-sm text-subtle-text">
              Exercise updated successfully
            </Text>
          </div>
        </Modal>

        {/* Error Modal */}
        <Modal
          visible={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          className="max-w-sm"
        >
          <div className="p-6 text-center">
            <Text variant="h3" className="text-lg font-bold mb-2 text-error">
              Error
            </Text>
            <Text className="text-sm text-subtle-text">
              Failed to update exercise
            </Text>
          </div>
        </Modal>
      </View>
    </div>
  );
}
