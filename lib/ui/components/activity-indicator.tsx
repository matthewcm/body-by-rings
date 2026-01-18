'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ActivityIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  size = 'large',
  color = 'var(--activity-indicator)',
}) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-transparent border-t-current',
          size === 'small' ? 'h-4 w-4' : 'h-8 w-8'
        )}
        style={{ borderTopColor: color }}
      />
    </div>
  );
};
