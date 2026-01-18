'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { PhaseSelector } from './components/phase-selector/phase-selector';
import { View, Text, ScrollView, ActivityIndicator, Card } from '@/lib/ui/components';
import { SignOutButton } from '@/shared/components/sign-out-button';

export default function Dashboard() {
  const templates = useQuery(api.workouts.get_all_workout_templates);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const { user } = useUser();
  const activeProgram = useQuery(api.programs.get_active_program);
  const phases = useQuery(api.phases.get_phases, activeProgram?._id ? { programId: activeProgram._id } : 'skip');

  const availablePhases = useMemo(() => {
    if (!phases) return [1];
    return [...new Set(phases.map(t => t.phase))].sort((a, b) => a - b);
  }, [phases]);

  const uniqueDays = useMemo(() => {
    if (!templates || templates.length === 0) return [];
    return [...new Set(
      templates
        .filter(t => t.phase === selectedPhase)
        .map(t => t.day)
    )].sort((a, b) => a - b);
  }, [templates, selectedPhase]);

  if (templates === undefined || activeProgram === undefined) {
    return (
      <View className="min-h-screen flex items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="min-h-screen bg-background">
      <View className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Text className="text-sm text-subtle-text">
            Welcome {user?.firstName || user?.primaryEmailAddress?.emailAddress}
          </Text>
          <SignOutButton />
        </div>

        <Text variant="h1" className="text-3xl font-bold text-center mb-8">
          XCEED
        </Text>

        {templates.length === 0 || !activeProgram ? (
          <Card className="p-8 text-center">
            <Text variant="h2" className="mb-4">No Active Program</Text>
            <Text className="text-subtle-text mb-6">
              You don't have an active program yet. Create one in the Plan tab to get started.
            </Text>
            <Link href="/plan">
              <button className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">
                Go to Plan
              </button>
            </Link>
          </Card>
        ) : (
          <>
            {phases && phases.length > 0 && (
              <PhaseSelector
                phases={availablePhases}
                selectedPhase={selectedPhase}
                onPhaseChange={setSelectedPhase}
              />
            )}

            <Text variant="h2" className="text-xl font-semibold mb-5 mt-6">
              Workouts for Phase {selectedPhase}
            </Text>

            {uniqueDays.length === 0 ? (
              <Card className="p-8 text-center">
                <Text variant="h3" className="mb-2">No workouts available for Phase {selectedPhase}</Text>
                <Text className="text-subtle-text">
                  Create a program and add exercises to get started
                </Text>
              </Card>
            ) : (
              <View className="space-y-4">
                {uniqueDays.map((day) => {
                  const phaseTemplate = phases?.find(t => t.phase === selectedPhase && t.day === day);
                  return (
                    <Link
                      key={day}
                      href={`/workout/${selectedPhase}/${day}`}
                      className="block"
                    >
                      <Card className="p-5 hover:bg-card/80 transition-colors cursor-pointer">
                        <Text variant="h3" className="text-lg font-bold text-primary mb-2">
                          Day {day}{phaseTemplate?.type ? ` : ${phaseTemplate.type}` : ''}
                        </Text>
                        <Text className="text-placeholder text-sm mb-2">
                          {phaseTemplate?.title || `Day ${day} workout`}
                        </Text>
                        <Text className="text-placeholder text-sm">
                          Tap to start your session
                        </Text>
                      </Card>
                    </Link>
                  );
                })}
              </View>
            )}

            <Link href="/custom-workout" className="block mt-4">
              <Card className="p-5 hover:bg-card/80 transition-colors cursor-pointer">
                <Text variant="h3" className="text-lg font-bold text-primary mb-2">
                  Custom Workout
                </Text>
                <Text className="text-placeholder text-sm mb-2">
                  Create your own workout session
                </Text>
                <Text className="text-placeholder text-sm">
                  Tap to start your session
                </Text>
              </Card>
            </Link>
          </>
        )}
      </View>
    </ScrollView>
  );
}


