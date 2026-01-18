'use client';

import React from 'react';
import { View, Text } from '@/lib/ui/components';
import { Mail, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileRowProps {
  icon: string;
  label: string;
  value: string;
}

const iconMap: Record<string, React.ReactNode> = {
  envelope: <Mail className="w-4 h-4 text-subtle-text" />,
  'calendar-alt': <Calendar className="w-4 h-4 text-subtle-text" />,
  'info-circle': <Info className="w-4 h-4 text-subtle-text" />,
};

export const ProfileRow = ({ icon, label, value }: ProfileRowProps) => (
  <View className="flex flex-row items-center mb-3 pb-3 border-b border-border">
    <div className="w-6 mr-3 flex items-center justify-center">
      {iconMap[icon] || <Info className="w-4 h-4 text-subtle-text" />}
    </div>
    <Text className="text-subtle-text text-base flex-1">{label}</Text>
    <Text className="text-text text-base font-semibold">{value}</Text>
  </View>
);
