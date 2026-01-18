'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  visible: boolean;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  className,
  children,
  ...props
}) => {
  React.useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 w-full rounded-lg border border-border bg-card shadow-lg',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};
Modal.displayName = 'Modal';
