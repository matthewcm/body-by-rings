import { THEME } from '@/shared/theme/colours';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  activeDates: Set<string>; // Set of date strings (YYYY-MM-DD) that have workouts
  onWeekChange: (date: Date) => void;
}

type ViewMode = 'week' | 'month';

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onDateChange,
  activeDates,
  onWeekChange,
}) => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const date = new Date(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // Update current month when selectedDate changes significantly
  React.useEffect(() => {
    const selected = new Date(selectedDate);
    const current = new Date(currentMonth);
    if (selected.getMonth() !== current.getMonth() || selected.getFullYear() !== current.getFullYear()) {
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Get all weeks for the current month
  const getMonthWeeks = (month: Date): Date[][] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Get the Monday of the week containing the first day
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    const weeks: Date[][] = [];
    let currentDate = new Date(startDate);
    
    // Generate 6 weeks to ensure full month coverage
    for (let week = 0; week < 6; week++) {
      const weekDates: Date[] = [];
      for (let day = 0; day < 7; day++) {
        weekDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDates);
      
      // Stop if we've passed the last day of the month and completed a full week
      if (weekDates[6] > lastDay && weekDates[0].getMonth() === monthIndex + 1) {
        break;
      }
    }
    
    return weeks;
  };

  // Get the week (Monday to Sunday) for the selected date
  const getWeekDates = (date: Date): Date[] => {
    const dateCopy = new Date(date);
    const day = dateCopy.getDay();
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
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

  // Get week number (ISO week number)
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
    // Update selected date to first day of new month
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
      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity onPress={() => navigateWeek('prev')} style={styles.navButton}>
          <Text style={styles.navButtonText}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.weekRange}>{getWeekRange()}</Text>
        <TouchableOpacity onPress={() => navigateWeek('next')} style={styles.navButton}>
          <Text style={styles.navButtonText}>&gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Week Calendar */}
      <View style={styles.calendar}>
        <View style={styles.dayNamesRowWeek}>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysRow}>
          {weekDates.map((date) => {
            const dateKey = formatDateKey(date);
            const workout = hasWorkout(date);
            const selected = isSelected(date);
            const today = isToday(date);

            return (
              <TouchableOpacity
                key={dateKey}
                style={[
                  styles.dayCell,
                  styles.dayCellWeek,
                  selected && styles.dayCellSelected,
                  today && !selected && styles.dayCellToday,
                ]}
                onPress={() => onDateChange(date)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    selected && styles.dayNumberSelected,
                    today && !selected && styles.dayNumberToday,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {workout && (
                  <View style={styles.workoutIndicators}>
                    <View
                      style={[
                        styles.workoutDot,
                        selected && styles.workoutDotSelected,
                      ]}
                    />
                    <View
                      style={[
                        styles.workoutDot,
                        selected && styles.workoutDotSelected,
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );

  const renderMonthView = () => (
    <>
      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <Text style={styles.monthYear}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <View style={styles.navControls}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
            <Text style={styles.navButtonText}>&lt;</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>TODAY</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
            <Text style={styles.navButtonText}>&gt;</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Month Calendar Grid */}
      <View style={styles.calendar}>
        {/* Day names header */}
        <View style={styles.dayNamesRow}>
          <View style={styles.weekNumberHeader}>
            <Text style={styles.weekNumberHeaderText}>W</Text>
          </View>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Weeks */}
        {monthWeeks.map((week, weekIndex) => {
          const weekNumber = getWeekNumber(week[0]);
          return (
            <View key={weekIndex} style={styles.weekRow}>
              <View style={styles.weekNumberCell}>
                <Text style={styles.weekNumberText}>W{weekNumber}</Text>
              </View>
              {week.map((date) => {
                const dateKey = formatDateKey(date);
                const workout = hasWorkout(date);
                const selected = isSelected(date);
                const today = isToday(date);
                const isCurrent = isCurrentMonth(date);

                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={[
                      styles.dayCell,
                      selected && styles.dayCellSelected,
                      today && !selected && styles.dayCellToday,
                      !isCurrent && styles.dayCellOtherMonth,
                    ]}
                    onPress={() => {
                      onDateChange(date);
                      // Update month if clicking on a date from another month
                      if (!isCurrent) {
                        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        selected && styles.dayNumberSelected,
                        today && !selected && styles.dayNumberToday,
                        !isCurrent && styles.dayNumberOtherMonth,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    {workout && (
                      <View style={styles.workoutIndicators}>
                        <View
                          style={[
                            styles.workoutDot,
                            selected && styles.workoutDotSelected,
                          ]}
                        />
                        <View
                          style={[
                            styles.workoutDot,
                            selected && styles.workoutDotSelected,
                          ]}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* View Mode Toggle */}
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
            Month
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'week' ? renderWeekView() : renderMonthView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: THEME.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: THEME.primary,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  viewModeTextActive: {
    color: THEME.background,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  weekRange: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    padding: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: THEME.background,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text,
  },
  calendar: {
    width: '100%',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 28, // Space for week number column
  },
  dayNamesRowWeek: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekNumberHeader: {
    width: 28,
    alignItems: 'center',
    marginRight: -28,
  },
  weekNumberHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.subtleText,
    textTransform: 'uppercase',
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.subtleText,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  weekNumberCell: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  weekNumberText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.subtleText,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    margin: 2,
    position: 'relative',
    minHeight: 36,
  },
  dayCellSelected: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)', // Light beige/yellow
  },
  dayCellToday: {
    backgroundColor: THEME.background,
  },
  dayCellOtherMonth: {
    opacity: 0.4,
  },
  dayCellWeek: {
    minHeight: 60,
  },
  daysRow: {
    flexDirection: 'row',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text,
  },
  dayNumberSelected: {
    color: THEME.text,
    fontWeight: 'bold',
  },
  dayNumberToday: {
    color: THEME.primary,
    fontWeight: 'bold',
  },
  dayNumberOtherMonth: {
    opacity: 0.5,
  },
  workoutIndicators: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.primary,
  },
  workoutDotSelected: {
    backgroundColor: THEME.text,
  },
});
