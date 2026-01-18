'use client';

import React, { useState, FormEvent } from 'react';
import { Modal, View, Text, Input, Textarea, Button } from '@/lib/ui/components';
import { X } from 'lucide-react';

interface CreateProgramModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, numberOfPhases: number) => Promise<void>;
}

export const CreateProgramModal = ({ visible, onClose, onCreate }: CreateProgramModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [numberOfPhases, setNumberOfPhases] = useState('3');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a program title');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a program description');
      return;
    }

    const phases = parseInt(numberOfPhases);
    if (isNaN(phases) || phases < 1 || phases > 10) {
      setError('Please enter a valid number of phases (1-10)');
      return;
    }

    setLoading(true);
    try {
      await onCreate(title.trim(), description.trim(), phases);
      setTitle('');
      setDescription('');
      setNumberOfPhases('3');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} className="max-h-[90vh]">
      <div className="flex flex-col max-h-[90vh]">
        <div className="flex flex-row justify-between items-center p-5 border-b border-border">
          <Text variant="h2" className="text-2xl font-bold">
            Create New Program
          </Text>
          <button
            onClick={onClose}
            className="p-1 hover:bg-card/50 rounded transition-colors"
          >
            <X className="w-5 h-5 text-text" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex-1 overflow-auto p-5">
          <div className="space-y-5">
            <div>
              <Text className="text-base font-semibold mb-2 block">Program Title</Text>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Body By Rings Program"
                required
                className="w-full"
              />
            </div>

            <div>
              <Text className="text-base font-semibold mb-2 block">Description</Text>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your workout program..."
                rows={4}
                required
                className="w-full"
              />
            </div>

            <div>
              <Text className="text-base font-semibold mb-2 block">Number of Phases</Text>
              <Input
                type="number"
                value={numberOfPhases}
                onChange={(e) => setNumberOfPhases(e.target.value)}
                placeholder="3"
                min="1"
                max="10"
                required
                className="w-full"
              />
              <Text className="text-xs text-placeholder mt-1">
                Enter a number between 1 and 10
              </Text>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20">
                <Text className="text-error text-sm">{error}</Text>
              </div>
            )}
          </div>
        </form>

        <div className="flex flex-row gap-3 p-5 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleCreate}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Program'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
