'use client';

import { cn } from '@/lib/utils';
import React from 'react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-white hover:bg-primary/90': variant === 'primary',
            'bg-card text-text hover:bg-card/80': variant === 'default',
            'bg-secondary text-text hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-card': variant === 'ghost',
            'bg-error text-white hover:bg-error/90': variant === 'destructive',
            'h-9 px-4 text-sm': size === 'sm',
            'h-10 px-6 text-base': size === 'md',
            'h-12 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg border border-border bg-card p-6', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

// Text Component
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
    
    const Component = variant.startsWith('h') ? `h${variant.slice(1)}` as keyof JSX.IntrinsicElements : 'p';
    
    return React.createElement(
      Component,
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

// View Component (replaces React Native View)
export const View: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex', className)} {...props}>
      {children}
    </div>
  );
};

// ScrollView Component (replaces React Native ScrollView)
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

// SafeAreaView Component
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

// TouchableOpacity Component
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

// ActivityIndicator Component
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

// Modal Component
interface ModalProps {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ visible, onClose, children, className }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={cn('bg-card rounded-lg max-w-md w-full max-h-[90vh] overflow-auto', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
