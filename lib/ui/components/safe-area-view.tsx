'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export const SafeAreaView: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('min-h-screen', className)} {...props}>
      {children}
    </div>
  );
};
