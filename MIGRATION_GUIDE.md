# Migration Guide: Expo/React Native to Next.js + Capacitor

This guide documents the migration from Expo/React Native to Next.js with Capacitor for mobile support.

## Migration Status

✅ **Completed:**
- Next.js project structure setup
- Capacitor configuration
- Core UI components (Button, Card, Input, etc.)
- Tailwind CSS setup
- Convex provider setup
- Clerk authentication provider
- Basic routing structure

🔄 **In Progress:**
- Migrating feature screens
- Converting React Native components to web components
- Updating styling from StyleSheet to Tailwind

⏳ **Pending:**
- Mobile-specific features (Camera, Haptics, etc.)
- Native module integrations
- Build and deployment configuration

## Key Changes

### 1. Project Structure

**Before (Expo Router):**
```
app/
  (tabs)/
    _layout.tsx
    (home)/
      index.tsx
```

**After (Next.js App Router):**
```
app-nextjs/
  layout.tsx
  page.tsx (home page)
  sign-in/
    page.tsx
```

### 2. Component Migration

**Before:**
```tsx
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { padding: 16 }
});
```

**After:**
```tsx
import { View, Text } from '@/lib/ui/components';
// or use Tailwind classes directly
<div className="p-4">
```

### 3. Navigation

**Before (Expo Router):**
```tsx
import { useRouter } from 'expo-router';
router.navigate('(home)');
```

**After (Next.js):**
```tsx
import { useRouter } from 'next/navigation';
router.push('/');
```

### 4. Authentication

**Before (Clerk Expo):**
```tsx
import { useUser } from '@clerk/clerk-expo';
```

**After (Clerk Next.js):**
```tsx
import { useUser } from '@clerk/nextjs';
// Server components
import { auth } from '@clerk/nextjs/server';
```

### 5. Styling

**Before:**
- React Native `StyleSheet`
- Theme object imported

**After:**
- Tailwind CSS classes
- CSS variables in `globals.css`

## Migration Steps

1. **Install Dependencies**
   ```bash
   npm install --save-dev @capacitor/cli
   npm install @capacitor/core @capacitor/ios @capacitor/android
   npm install @capacitor/app @capacitor/status-bar @capacitor/keyboard
   npm install @clerk/nextjs
   npm install next react react-dom
   npm install tailwindcss postcss autoprefixer
   ```

2. **Copy Configuration Files**
   - `next.config.js` ✅
   - `tailwind.config.ts` ✅
   - `capacitor.config.ts` ✅
   - `tsconfig-nextjs.json` ✅

3. **Update package.json**
   - Use `package-nextjs.json` as reference
   - Update scripts section

4. **Migrate Components**
   - Replace React Native components with web equivalents
   - Convert StyleSheet to Tailwind classes
   - Update navigation imports

5. **Migrate Screens**
   - Dashboard ✅ (in progress)
   - Sign In ✅ (needs migration)
   - Sign Up ✅ (needs migration)
   - Diary (pending)
   - Stats (pending)
   - Plan (pending)
   - Profile (pending)
   - Workout (pending)

6. **Capacitor Setup**
   ```bash
   npx cap init
   npx cap add ios
   npx cap add android
   npx cap sync
   ```

7. **Build for Mobile**
   ```bash
   npm run build
   npx cap sync
   npx cap open ios
   npx cap open android
   ```

## Component Mapping

| React Native | Next.js Equivalent |
|--------------|-------------------|
| `View` | `div` or `<View>` from `@/lib/ui/components` |
| `Text` | `p`, `span`, or `<Text>` from `@/lib/ui/components` |
| `TextInput` | `<Input>` from `@/lib/ui/components` or `input` |
| `TouchableOpacity` | `<Button>` or `<TouchableOpacity>` from `@/lib/ui/components` |
| `ScrollView` | `<ScrollView>` from `@/lib/ui/components` or `div` with overflow |
| `SafeAreaView` | `<SafeAreaView>` from `@/lib/ui/components` |
| `ActivityIndicator` | `<ActivityIndicator>` from `@/lib/ui/components` |
| `StyleSheet.create()` | Tailwind CSS classes |
| `Alert.alert()` | Browser `alert()` or custom modal |

## Mobile-Specific Features

### Camera/Image Picker
- Replace `expo-image-picker` with Capacitor Camera plugin
- Or use web `input[type="file"]` with accept="image/*"

### Haptics
- Replace `expo-haptics` with Capacitor Haptics plugin (if needed)

### Native Modules
- Review all native module dependencies
- Find web alternatives or Capacitor plugins

## Testing Checklist

- [ ] Authentication flow works
- [ ] Navigation between pages
- [ ] Convex queries/mutations work
- [ ] Styling looks correct
- [ ] Forms submit correctly
- [ ] Mobile responsive design
- [ ] iOS build succeeds
- [ ] Android build succeeds

## Notes

- The `app-nextjs/` folder contains the new Next.js structure
- Original Expo files remain in `app/` for reference
- Shared components need migration from React Native to web
- Some features may need web alternatives (e.g., native image picker → file input)
