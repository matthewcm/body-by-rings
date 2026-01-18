'use client';

import React from 'react';
import { View, Text, Card } from '@/lib/ui/components';
import { PlusCircle, ChevronRight, Flag, Trash2, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  disabled?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  'plus-circle': <PlusCircle className="w-6 h-6" />,
  'flag': <Flag className="w-6 h-6" />,
  'trash': <Trash2 className="w-6 h-6" />,
  'seedling': <Sprout className="w-6 h-6" />,
};

export const ActionButton = ({
  icon,
  title,
  subtitle,
  onPress,
  disabled = false,
}: ActionButtonProps) => (
  <button
    onClick={onPress}
    disabled={disabled}
    className={cn(
      'w-full text-left transition-opacity',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <Card
      className={cn(
        'p-4 mb-4 flex flex-row items-center',
        disabled && 'bg-[#2a2a2a]'
      )}
    >
      <div className={cn(disabled ? 'text-placeholder' : 'text-primary')}>
        {iconMap[icon] || <PlusCircle className="w-6 h-6" />}
      </div>
      <View className="flex-1 ml-4">
        <Text
          className={cn(
            'text-base font-bold',
            disabled ? 'text-placeholder' : 'text-text'
          )}
        >
          {title}
        </Text>
        <Text className="text-placeholder text-xs mt-0.5">
          {subtitle}
        </Text>
      </View>
      <ChevronRight className="w-4 h-4 text-placeholder" />
    </Card>
  </button>
);
