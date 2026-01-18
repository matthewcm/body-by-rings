'use client';

import React from 'react';
import { View, Text, Card } from '@/lib/ui/components';
import { Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  title: string;
  description: string;
  isActive: boolean;
}

export const PlanCard = ({ title, description, isActive }: PlanCardProps) => (
  <Card
    className={cn(
      'p-4 mb-4 relative',
      isActive && 'border-2 border-primary'
    )}
  >
    <View className="flex flex-row items-center mb-2">
      <Shield className="w-5 h-5 text-primary mr-3" />
      <Text variant="h3" className="text-lg font-bold">
        {title}
      </Text>
    </View>
    <Text className="text-subtle-text text-sm mt-1 leading-5">
      {description}
    </Text>
    {isActive && (
      <Text className="text-primary font-bold absolute top-4 right-4">
        Active
      </Text>
    )}
  </Card>
);
