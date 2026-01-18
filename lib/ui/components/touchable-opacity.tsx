'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface TouchableOpacityProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const TouchableOpacity: React.FC<TouchableOpacityProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn('cursor-pointer transition-opacity active:opacity-70', className)}
      {...props}
    >
      {children}
    </button>
  );
};
