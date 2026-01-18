'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Card } from '@/lib/ui/components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  activeDates: Set<string>;
  onWeekChange: (date: Date) => void;
}

type ViewMode = 'week' | 'month';

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onDateChange,
  activeDates,
  onWeekChange,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  useEffect(() => {
    const selected = new Date(selectedDate);
    const current = new Date(currentMonth);
    if (selected.getMonth() !== current.getMonth() || selected.getFullYear() !== current.getFullYear()) {
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [selectedDate]);

  const getMonthWeeks = (month: Date): Date[][] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    const weeks: Date[][] = [];
    let currentDate = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDates: Date[] = [];
      for (let day = 0; day < 7; day++) {
        weekDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDates);
      
      if (weekDates[6] > lastDay && weekDates[0].getMonth() === monthIndex + 1) {
        break;
      }
    }
    
    return weeks;
  };

  const getWeekDates = (date: Date): Date[] => {
    const dateCopy = new Date(date);
    const day = dateCopy.getDay();
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateCopy);
    monday.setDate(diff);
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const monthWeeks = getMonthWeeks(currentMonth);
  const weekDates = getWeekDates(selectedDate);

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return formatDateKey(date) === formatDateKey(selectedDate);
  };

  const hasWorkout = (date: Date): boolean => {
    return activeDates.has(formatDateKey(date));
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
    onWeekChange(new Date(newMonth));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(newDate);
    onWeekChange(newDate);
  };

  const getWeekRange = (): string => {
    const start = weekDates[0];
    const end = weekDates[6];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateChange(today);
    onWeekChange(today);
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const renderWeekView = () => (
    <>
      <div className="flex flex-row justify-between items-center mb-4">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-1 min-w-[32px] text-center hover:bg-card/50 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-text" />
        </button>
        <Text className="text-base font-semibold text-text">
          {getWeekRange()}
        </Text>
        <button
          onClick={() => navigateWeek('next')}
          className="p-1 min-w-[32px] text-center hover:bg-card/50 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-text" />
        </button>
      </div>

      <div className="w-full">
        <div className="flex flex-row mb-2">
          {dayNames.map((day) => (
            <div key={day} className="flex-1 text-center">
              <Text className="text-xs font-semibold text-subtle-text uppercase">
                {day}
              </Text>
            </div>
          ))}
        </div>

        <div className="flex flex-row">
          {weekDates.map((date) => {
            const dateKey = formatDateKey(date);
            const workout = hasWorkout(date);
            const selected = isSelected(date);
            const today = isToday(date);

            return (
              <button
                key={dateKey}
                onClick={() => onDateChange(date)}
                className={cn(
                  'flex-1 aspect-square flex flex-col items-center justify-center rounded-md m-0.5 relative min-h-[60px] transition-colors',
                  selected && 'bg-primary/30',
                  today && !selected && 'bg-background',
                  !today && !selected && 'hover:bg-card/50'
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-medium',
                    selected && 'text-text font-bold',
                    today && !selected && 'text-primary font-bold',
                    !selected && !today && 'text-text'
                  )}
                >
                  {date.getDate()}
                </Text>
                {workout && (
                  <div className="absolute bottom-1 flex flex-row gap-0.5 items-center justify-center">
                    <div
                      className={cn(
                        'w-1 h-1 rounded-full',
                        selected ? 'bg-text' : 'bg-primary'
                      )}
                    />
                    <div
                      className={cn(
                        'w-1 h-1 rounded-full',
                        selected ? 'bg-text' : 'bg-primary'
                      )}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  const renderMonthView = () => (
    <>
      <div className="flex flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-text">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <div className="flex flex-row items-center gap-3">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 min-w-[32px] text-center hover:bg-card/50 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-text" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-md bg-background text-xs font-semibold text-text hover:bg-card/50 transition-colors"
          >
            TODAY
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 min-w-[32px] text-center hover:bg-card/50 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-text" />
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="flex flex-row mb-2 pl-7">
          <div className="w-7 -ml-7 text-center">
            <Text className="text-xs font-semibold text-subtle-text uppercase">
              W
            </Text>
          </div>
          {dayNames.map((day) => (
            <div key={day} className="flex-1 text-center">
              <Text className="text-xs font-semibold text-subtle-text uppercase">
                {day}
              </Text>
            </div>
          ))}
        </div>

        {monthWeeks.map((week, weekIndex) => {
          const weekNumber = getWeekNumber(week[0]);
          return (
            <div key={weekIndex} className="flex flex-row mb-1 items-center">
              <div className="w-7 mr-1 text-center flex items-center justify-center">
                <Text className="text-xs font-semibold text-subtle-text">
                  W{weekNumber}
                </Text>
              </div>
              {week.map((date) => {
                const dateKey = formatDateKey(date);
                const workout = hasWorkout(date);
                const selected = isSelected(date);
                const today = isToday(date);
                const isCurrent = isCurrentMonth(date);

                return (
                  <button
                    key={dateKey}
                    onClick={() => {
                      onDateChange(date);
                      if (!isCurrent) {
                        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                      }
                    }}
                    className={cn(
                      'flex-1 aspect-square flex flex-col items-center justify-center rounded-md m-0.5 relative min-h-[36px] transition-colors',
                      selected && 'bg-primary/30',
                      today && !selected && 'bg-background',
                      !isCurrent && 'opacity-40',
                      !today && !selected && isCurrent && 'hover:bg-card/50'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        selected && 'text-text font-bold',
                        today && !selected && 'text-primary font-bold',
                        !isCurrent && 'opacity-50',
                        !selected && !today && isCurrent && 'text-text'
                      )}
                    >
                      {date.getDate()}
                    </Text>
                    {workout && (
                      <div className="absolute bottom-1 flex flex-row gap-0.5 items-center justify-center">
                        <div
                          className={cn(
                            'w-1 h-1 rounded-full',
                            selected ? 'bg-text' : 'bg-primary'
                          )}
                        />
                        <div
                          className={cn(
                            'w-1 h-1 rounded-full',
                            selected ? 'bg-text' : 'bg-primary'
                          )}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-row bg-background rounded-lg p-1 mb-4">
        <button
          onClick={() => setViewMode('week')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-center transition-colors',
            viewMode === 'week' ? 'bg-primary text-background' : 'text-text hover:bg-card/50'
          )}
        >
          <Text className={cn('text-sm font-semibold', viewMode === 'week' && 'text-background')}>
            Week
          </Text>
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-center transition-colors',
            viewMode === 'month' ? 'bg-primary text-background' : 'text-text hover:bg-card/50'
          )}
        >
          <Text className={cn('text-sm font-semibold', viewMode === 'month' && 'text-background')}>
            Month
          </Text>
        </button>
      </div>

      {viewMode === 'week' ? renderWeekView() : renderMonthView()}
    </Card>
  );
};
