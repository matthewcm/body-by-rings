'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'body', children, ...props }, ref) => {
    const baseClasses = 'text-text';
    const variantClasses = {
      h1: 'text-3xl font-bold',
      h2: 'text-2xl font-semibold',
      h3: 'text-xl font-medium',
      body: 'text-base',
      caption: 'text-sm text-subtle-text',
    };
    
    const tagName = variant.startsWith('h') ? `h${variant.slice(1)}` : 'p';
    
    return React.createElement(
      tagName as keyof React.JSX.IntrinsicElements,
      {
        ref,
        className: cn(baseClasses, variantClasses[variant], className),
        ...props,
      },
      children
    );
  }
);
Text.displayName = 'Text';
