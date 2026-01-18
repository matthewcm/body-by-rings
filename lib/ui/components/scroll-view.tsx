'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export const ScrollView: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('overflow-auto', className)} {...props}>
      {children}
    </div>
  );
};
