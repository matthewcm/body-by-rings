# Migration Status: Features Components

## ✅ Completed Migrations

### 1. Dashboard Screen ✅
- `features/dashboard-screen/dashboard-screen.tsx` - Fully migrated to Next.js
- `features/dashboard-screen/components/phase-selector/phase-selector.tsx` - Migrated to Next.js

### 2. Authentication Screens ✅
- `features/sign-in-screen/components/sign-in-screen.tsx` - Fully migrated
- `features/sign-in-screen/components/sign-up-screen.tsx` - Fully migrated

### 3. Profile Screen ✅
- `features/profile-screen/profile-screen.tsx` - Fully migrated
- `features/profile-screen/components/profile-row.tsx` - Migrated (uses Lucide icons)

### 4. Shared Components ✅
- `shared/components/sign-out-button.tsx` - Fully migrated

### 5. Plan Screen Components (Partial) ✅
- `features/plan-screen/components/plan-card.tsx` - Migrated
- `features/plan-screen/components/action-button.tsx` - Migrated

## 🔄 In Progress / Remaining

### Plan Screen
- [ ] `features/plan-screen/plan.tsx` - Main component (needs migration)
- [ ] `features/plan-screen/components/confirm-modal.tsx` - Needs migration
- [ ] `features/plan-screen/components/create-program-modal.tsx` - Needs migration
- [ ] `features/plan-screen/components/edit-program-modal.tsx` - Needs migration
- [ ] `features/plan-screen/components/exercise-picker-modal.tsx` - Needs migration

### Diary Screen
- [ ] `features/diary-screen/diary-screen.tsx` - Main component
- [ ] `features/diary-screen/components/calendar-widget.tsx` - Calendar component
- [ ] `features/diary-screen/components/metrics-widget.tsx` - Metrics display
- [ ] `features/diary-screen/components/performance-chart.tsx` - Performance chart
- [ ] `features/diary-screen/components/muscle-usage-chart.tsx` - Muscle usage chart
- [ ] `features/diary-screen/components/diary-table.tsx` - Diary table
- [ ] `features/diary-screen/components/activity-modal.tsx` - Activity modal

### Stats Screen
- [ ] `features/stats-screen/stats-screen.tsx` - Main component
- [ ] `features/stats-screen/components/progression-table/progression-table.tsx` - Progression table

### Workout Screen
- [ ] `features/workout-screen/workout-screen.tsx` - Main component
- [ ] `features/workout-screen/components/exercise-card.tsx` - Exercise card
- [ ] `features/workout-screen/components/wod-card.tsx` - WOD card
- [ ] `features/workout-screen/components/workout-summary-modal.tsx` - Summary modal

### Custom Workout Screen
- [ ] `features/custom-workout-screen/custom-workout-screen.tsx` - Main component
- [ ] `features/custom-workout-screen/components/new-exercise-card.tsx` - New exercise card
- [ ] `features/custom-workout-screen/components/create-new-exercise-button.tsx` - Create button

### Shared Components
- [ ] `shared/components/muscle-map/muscle-map.tsx` - Muscle visualization
- [ ] `shared/components/wod-scanner/wod-scanner.tsx` - WOD scanner
- [ ] `shared/components/external-link.tsx` - External link
- [ ] `shared/components/haptic-tab.tsx` - Haptic tab (may need web alternative)
- [ ] `shared/components/hello-wave.tsx` - Hello wave
- [ ] `shared/components/themed-text.tsx` - Themed text
- [ ] `shared/components/themed-view.tsx` - Themed view
- [ ] `shared/components/ui/collapsible.tsx` - Collapsible component
- [ ] `shared/components/parallax-scroll-view.tsx` - Parallax scroll (may need web alternative)

### Hooks
- [ ] `shared/hooks/use-color-scheme.ts` - Color scheme hook
- [ ] `shared/hooks/use-theme-color.ts` - Theme color hook
- [ ] `shared/hooks/use-countdown.tsx` - Countdown hook

## 🔧 Migration Pattern

For remaining components, follow this pattern:

### 1. Update Imports
```tsx
// Before (Expo)
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { FontAwesome5 } from '@expo/vector-icons';

// After (Next.js)
'use client';
import { View, Text } from '@/lib/ui/components';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { IconName } from 'lucide-react'; // Or use lucide icons
```

### 2. Convert Styling
```tsx
// Before
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: THEME.card }
});
<View style={styles.container}>

// After
<View className="p-4 bg-card">
```

### 3. Update Navigation
```tsx
// Before
import { Link } from 'expo-router';
<Link href="/workout/1/1" asChild>

// After
import Link from 'next/link';
<Link href="/workout/1/1">
```

### 4. Update Forms
```tsx
// Before
<TouchableOpacity onPress={handleSubmit}>

// After
<form onSubmit={handleSubmit}>
  <Button type="submit">Submit</Button>
</form>
```

### 5. Update Icons
```tsx
// Before
import { FontAwesome5 } from '@expo/vector-icons';
<FontAwesome5 name="home" size={24} color={THEME.primary} />

// After
import { Home } from 'lucide-react';
<Home className="w-6 h-6 text-primary" />
```

## 📝 Key Changes Summary

1. **React Native → Web Components**
   - `View` → `div` or `<View>` from `@/lib/ui/components`
   - `Text` → `p`/`span` or `<Text>` from `@/lib/ui/components`
   - `TextInput` → `<Input>` from `@/lib/ui/components`
   - `TouchableOpacity` → `<Button>` or `<TouchableOpacity>` from `@/lib/ui/components`
   - `ScrollView` → `<ScrollView>` from `@/lib/ui/components` or `div` with overflow
   - `SafeAreaView` → `<SafeAreaView>` from `@/lib/ui/components`

2. **Styling**
   - `StyleSheet.create()` → Tailwind CSS classes
   - `THEME` constants → CSS variables (defined in `globals.css`)

3. **Navigation**
   - `expo-router` → `next/navigation`
   - `useRouter()` from expo → `useRouter()` from Next.js
   - `Link` component updated

4. **Authentication**
   - `@clerk/clerk-expo` → `@clerk/nextjs`
   - Server components can use `auth()` from `@clerk/nextjs/server`

5. **Icons**
   - `@expo/vector-icons/FontAwesome5` → `lucide-react` icons
   - Icon names need to be mapped to Lucide equivalents

## 🚨 Important Notes

1. **Modal Components**: Need to create or use a modal library (e.g., Radix UI Dialog or custom modal)

2. **Native Features**:
   - `react-native-body-highlighter` may need a web alternative or conditional rendering
   - Haptics won't work on web (may need Capacitor plugin or conditional logic)
   - Image picker needs web alternative (`<input type="file">` or Capacitor Camera)

3. **Charts**: May need to use web-compatible chart libraries (e.g., Recharts, Chart.js, or similar)

4. **Calendar**: May need to use a web-compatible calendar library

5. **Date/Time**: Use standard JavaScript `Date` objects or libraries like `date-fns` or `dayjs`

## Next Steps

1. Continue migrating remaining screens one by one
2. Test each migrated component in the browser
3. Handle platform-specific features (camera, haptics, etc.)
4. Update any remaining hooks and utilities
5. Test the complete application flow
