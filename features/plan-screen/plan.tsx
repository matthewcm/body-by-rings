'use client';

import { api } from '@/convex/_generated/api';
import { Button, Card, Text, View } from '@/lib/ui/components';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { CalendarX, Edit, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ActionButton } from './components/action-button';
import { ConfirmModal } from './components/confirm-modal';
import { CreateProgramModal } from './components/create-program-modal';
import { EditProgramModal } from './components/edit-program-modal';
import { PlanCard } from './components/plan-card';

export default function PlanScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  const activeProgram = useQuery(api.programs.get_active_program);
  const allPrograms = useQuery(api.programs.get_all_programs);
  const deactivateProgram = useMutation(api.programs.deactivate_program);
  const activateProgram = useMutation(api.programs.activate_program);
  const createProgram = useMutation(api.programs.create_program);
  const ensureDefaultProgram = useMutation(api.seed_default_program.ensure_default_program);

  useEffect(() => {
    if (
      isLoaded &&
      isSignedIn &&
      activeProgram !== undefined && 
      allPrograms !== undefined && 
      activeProgram === null && 
      allPrograms.length === 0
    ) {
      ensureDefaultProgram({}).catch(err => {
        const errorMessage = err?.message || err?.toString() || '';
        if (errorMessage.includes('logged in') || errorMessage.includes('must be logged in')) {
          return;
        }
        console.error('Error ensuring default program:', err);
      });
    }
  }, [isLoaded, isSignedIn, activeProgram, allPrograms, ensureDefaultProgram]);

  const handleDeactivate = async () => {
    try {
      const result = await deactivateProgram({});
      if (result?.success) {
        setShowDisableConfirm(false);
      } else {
        console.error('Failed to disable program:', result?.message);
      }
    } catch (error) {
      console.error('Error disabling program:', error);
    }
  };

  const handleCreateProgram = async (title: string, description: string, numberOfPhases: number) => {
    await createProgram({ title, description, numberOfPhases });
    setShowCreateModal(false);
  };

  return (
    <div className="screen-container w-full">
      <View className="w-full flex flex-col">
        <Text variant="h1" className="text-3xl font-bold text-center mb-6">
          Workout Plan
        </Text>

        {activeProgram ? (
          <>
            <Text variant="h2" className="text-xl font-semibold mb-4 mt-2">
              Current Program
            </Text>
            <PlanCard
              title={activeProgram.title}
              description={activeProgram.description}
              isActive={true}
            />
            
            <View className="flex flex-row gap-3 mb-6">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(true)}
                className="flex-1 flex flex-row items-center justify-center gap-2 border border-primary"
              >
                <Edit className="w-4 h-4 text-text" />
                <Text className="text-text font-semibold text-sm">Edit Program</Text>
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => setShowDisableConfirm(true)}
                className="flex-1 flex flex-row items-center justify-center gap-2 border border-error"
              >
                <X className="w-4 h-4 text-text" />
                <Text className="text-text font-semibold text-sm">Disable</Text>
              </Button>
            </View>
          </>
        ) : (
          <>
            <Text variant="h2" className="text-xl font-semibold mb-4 mt-2">
              Current Program
            </Text>
            <Card className="p-10 text-center">
              <CalendarX className="w-12 h-12 text-placeholder mx-auto mb-4" />
              <Text variant="h3" className="text-lg font-semibold mb-2">
                No active program
              </Text>
              <Text className="text-subtle-text text-sm">
                Create a new program or switch to an existing one
              </Text>
            </Card>
          </>
        )}

        {allPrograms && allPrograms.length > 0 && (
          <>
            <Text variant="h2" className="text-xl font-semibold mb-4 mt-6">
              All Programs
            </Text>
            <div className="space-y-3 mb-6">
              {allPrograms.map((program) => (
                <div
                  key={program._id}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-colors',
                    program.isActive
                      ? 'border-primary border-2 bg-card'
                      : 'border-border bg-card hover:bg-card/80'
                  )}
                >
                  <div className="flex flex-row justify-between items-start mb-2">
                    <Text variant="h3" className="text-lg font-bold flex-1">
                      {program.title}
                    </Text>
                    {program.isActive && (
                      <span className="px-2 py-1 rounded bg-primary text-background text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <Text className="text-subtle-text text-sm mb-2 leading-5">
                    {program.description}
                  </Text>
                  <Text className="text-placeholder text-xs">
                    {program.numberOfPhases} phase{program.numberOfPhases !== 1 ? 's' : ''}
                  </Text>
                  {!program.isActive && (
                    <Button
                      variant="secondary"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await activateProgram({ programId: program._id });
                        } catch (error) {
                          console.error('Error activating program:', error);
                        }
                      }}
                      className="mt-3 px-3 py-2 text-sm border border-primary flex flex-row items-center gap-1.5"
                    >
                      <span className="text-white ">✓</span>
                      <Text className="text-white font-semibold text-sm">Switch to</Text>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <Text variant="h2" className="text-xl font-semibold mb-4 mt-6">
          Actions
        </Text>
        <ActionButton
          icon="plus-circle"
          title="Create a New Program"
          subtitle="Build your own workout program from scratch."
          onPress={() => setShowCreateModal(true)}
          disabled={false}
        />
        {(!activeProgram && (!allPrograms || allPrograms.length === 0)) && (
          <ActionButton
            icon="seedling"
            title="Create Default Program"
            subtitle="Create the default Body By Rings calisthenics program."
            onPress={async () => {
              try {
                const result = await ensureDefaultProgram({});
                if (result?.success) {
                  console.log('Default program created:', result.message);
                } else {
                  console.log('Default program creation:', result?.message);
                }
              } catch (error) {
                console.error('Error creating default program:', error);
              }
            }}
            disabled={false}
          />
        )}
      </View>

      <CreateProgramModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProgram}
      />

      <EditProgramModal
        visible={showEditModal}
        programId={activeProgram?._id || null}
        onClose={() => setShowEditModal(false)}
      />

      <ConfirmModal
        visible={showDisableConfirm}
        title="Disable Program"
        message="This will deactivate the current program. You can switch back to it later. Your custom workouts will remain available. Continue?"
        confirmText="Disable"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleDeactivate}
        onCancel={() => setShowDisableConfirm(false)}
      />
    </div>
  );
}
