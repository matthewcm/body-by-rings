# Migration Summary: Expo → Next.js + Capacitor

## ✅ What Has Been Completed

### 1. Project Structure ✅
- Created Next.js App Router structure in `app-nextjs/`
- Set up core layout with providers (Clerk, Convex, Tailwind)
- Created basic routing structure

### 2. Configuration Files ✅
- ✅ `next.config.js` - Next.js configuration with webpack aliases for React Native Web
- ✅ `tailwind.config.ts` - Tailwind CSS with theme variables matching your current design
- ✅ `postcss.config.js` - PostCSS for Tailwind processing
- ✅ `capacitor.config.ts` - Capacitor configuration for iOS/Android
- ✅ `tsconfig-nextjs.json` - TypeScript configuration for Next.js
- ✅ `package-nextjs.json` - Updated dependencies list

### 3. Core Libraries ✅
- ✅ Convex provider (`lib/convex-provider.tsx`) - Convex client setup for Next.js
- ✅ UI components library (`lib/ui/components.tsx`) - Reusable web components (Button, Card, Input, View, Text, etc.)
- ✅ Utilities (`lib/utils.ts`) - Helper functions (cn for className merging)

### 4. Example Migrations ✅
- ✅ Sign In Screen (`features/sign-in-screen/components/sign-in-screen-nextjs.tsx`)
- ✅ Sign Out Button (`shared/components/sign-out-button-nextjs.tsx`)
- ✅ Dashboard Screen (`features/dashboard-screen/dashboard-screen-nextjs.tsx`)

### 5. Documentation ✅
- ✅ `MIGRATION_GUIDE.md` - Comprehensive migration guide
- ✅ `MIGRATION_SCRIPT.md` - Step-by-step execution instructions
- ✅ `README_MIGRATION.md` - Overview and reference

## 📋 What Needs to Be Done

### Remaining Screen Migrations
- [ ] Sign Up Screen
- [ ] Diary Screen (with calendar widget, charts, metrics)
- [ ] Stats Screen (with progression table, exercise editing, muscle mapping)
- [ ] Plan Screen (with program management modals)
- [ ] Profile Screen
- [ ] Workout Screen (with exercise cards, WOD cards)
- [ ] Custom Workout Screen (with AI scanner integration)

### Component Migrations
- [ ] Phase Selector
- [ ] Exercise Card
- [ ] WOD Card
- [ ] Workout Summary Modal
- [ ] Activity Modal
- [ ] Calendar Widget
- [ ] Metrics Widget
- [ ] Performance Chart
- [ ] Muscle Usage Chart
- [ ] Progression Table
- [ ] Plan Card
- [ ] Action Button
- [ ] Confirm Modal
- [ ] Create Program Modal
- [ ] Edit Program Modal
- [ ] Exercise Picker Modal
- [ ] New Exercise Card
- [ ] Create New Exercise Button
- [ ] Muscle Map component
- [ ] WOD Scanner
- [ ] All other shared components

### Hook Migrations
- [ ] `use-color-scheme.ts` - Update for Next.js
- [ ] `use-countdown.tsx` - Verify compatibility
- [ ] `use-theme-color.ts` - Update for Tailwind/CSS variables

### Mobile Features
- [ ] Image picker (replace expo-image-picker with Capacitor Camera or web input)
- [ ] Haptics (replace expo-haptics - may not be needed on web)
- [ ] Safe area handling (CSS-based or Capacitor plugin)
- [ ] Native module replacements

### Build & Deployment
- [ ] Update package.json scripts
- [ ] Set up environment variables
- [ ] Configure Capacitor for iOS
- [ ] Configure Capacitor for Android
- [ ] Test builds on both platforms

## 🚀 Next Steps

1. **Install Dependencies:**
   ```bash
   # Review and merge package-nextjs.json into package.json
   npm install
   ```

2. **Set Up Environment:**
   ```bash
   # Create .env.local with your keys
   NEXT_PUBLIC_CONVEX_URL=your_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret
   ```

3. **Initialize Capacitor:**
   ```bash
   npm install @capacitor/cli @capacitor/core
   npm install @capacitor/ios @capacitor/android
   npm install @capacitor/app @capacitor/status-bar @capacitor/keyboard
   npx cap init
   npx cap add ios
   npx cap add android
   ```

4. **Test Basic Setup:**
   ```bash
   npm run dev
   # Should start Next.js on http://localhost:3000
   ```

5. **Migrate Remaining Screens:**
   - Follow the examples in `sign-in-screen-nextjs.tsx` and `dashboard-screen-nextjs.tsx`
   - Convert StyleSheet to Tailwind classes
   - Replace React Native components with web equivalents
   - Update navigation imports

6. **Build & Test:**
   ```bash
   npm run build
   npx cap sync
   npx cap open ios
   npx cap open android
   ```

## 📝 Migration Pattern

For each screen/component, follow this pattern:

1. **Change imports:**
   ```tsx
   // From
   import { View, Text, StyleSheet } from 'react-native';
   import { useRouter } from 'expo-router';
   import { useUser } from '@clerk/clerk-expo';
   
   // To
   'use client';
   import { View, Text } from '@/lib/ui/components';
   import { useRouter } from 'next/navigation';
   import { useUser } from '@clerk/nextjs';
   import Link from 'next/link';
   ```

2. **Convert styling:**
   ```tsx
   // From
   const styles = StyleSheet.create({
     container: { padding: 16, backgroundColor: THEME.card }
   });
   <View style={styles.container}>
   
   // To
   <View className="p-4 bg-card">
   // or use the component's className prop
   ```

3. **Update navigation:**
   ```tsx
   // From
   router.navigate('(home)');
   <Link href="/workout/1/1" asChild>
   
   // To
   router.push('/');
   <Link href="/workout/1/1">
   ```

4. **Update forms:**
   ```tsx
   // Add form element and onSubmit handler
   <form onSubmit={handleSubmit}>
     <Input ... />
     <Button type="submit">Submit</Button>
   </form>
   ```

## 🔍 Key Files Reference

- **Structure:** `app-nextjs/` - Next.js App Router structure
- **Components:** `lib/ui/components.tsx` - Reusable UI components
- **Providers:** `lib/convex-provider.tsx` - Convex setup
- **Styles:** `app-nextjs/globals.css` - Global CSS with theme variables
- **Config:** `next.config.js`, `tailwind.config.ts`, `capacitor.config.ts`

## 📚 Additional Resources

- See `MIGRATION_GUIDE.md` for detailed migration steps
- See `MIGRATION_SCRIPT.md` for execution checklist
- See `README_MIGRATION.md` for complete reference

## ⚠️ Important Notes

1. **Keep both versions:** The original Expo code remains in `app/` for reference
2. **Gradual migration:** Migrate screens one at a time and test
3. **Test on web first:** Ensure web version works before testing mobile
4. **Mobile considerations:** Some features may need platform-specific implementations
5. **Environment variables:** Update all `EXPO_PUBLIC_*` to `NEXT_PUBLIC_*`

The foundation is complete! Continue migrating remaining screens and components following the established patterns.
