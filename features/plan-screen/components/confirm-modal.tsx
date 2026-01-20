'use client';

import { Button, Modal, Text, View } from '@/lib/ui/components';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmModalProps) => {
  return (
    <Modal visible={visible} onClose={onCancel}>
      <div className="p-6">
        <View className="flex flex-row items-center mb-4 gap-3">
          {destructive ? (
            <AlertTriangle className="w-6 h-6 text-error" />
          ) : (
            <Info className="w-6 h-6 text-primary" />
          )}
          <Text variant="h2" className="text-xl font-bold flex-1">
            {title}
          </Text>
        </View>

        <Text className="text-subtle-text text-base leading-6 mb-6">
          {message}
        </Text>

        <View className="flex flex-row gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </View>
      </div>
    </Modal>
  );
};
