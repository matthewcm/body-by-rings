'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export const View: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {children}
    </div>
  );
};
