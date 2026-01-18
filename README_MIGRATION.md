# Next.js + Capacitor Migration Summary

## Overview

This project has been migrated from **Expo/React Native** to **Next.js with Capacitor** for mobile support. The migration provides:

- ✅ Web-first development with Next.js App Router
- ✅ Mobile app deployment via Capacitor (iOS & Android)
- ✅ Modern UI with Tailwind CSS
- ✅ Type-safe routing and components
- ✅ Server and client components support

## Project Structure

```
body-by-rings/
├── app-nextjs/              # Next.js App Router structure
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page (dashboard)
│   ├── sign-in/
│   │   └── page.tsx        # Sign in page
│   └── sign-up/
│       └── page.tsx        # Sign up page
├── lib/
│   ├── convex-provider.tsx # Convex client provider
│   ├── ui/
│   │   └── components.tsx  # Reusable UI components
│   └── utils.ts            # Utility functions
├── features/               # Feature screens (to be migrated)
├── shared/                 # Shared components (to be migrated)
├── convex/                 # Convex backend (unchanged)
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── capacitor.config.ts     # Capacitor configuration
└── package-nextjs.json     # Updated dependencies

```

## Key Changes

### 1. Framework Migration

**From:** Expo Router (file-based routing)  
**To:** Next.js App Router (directory-based routing)

**Example:**
```tsx
// Before (Expo)
app/(tabs)/(home)/index.tsx

// After (Next.js)
app/page.tsx
```

### 2. Component Library

**From:** React Native components  
**To:** Web components with React Native Web compatibility

**Migration:**
- `View` → `div` or custom `<View>` component
- `Text` → `p`/`span` or custom `<Text>` component
- `StyleSheet.create()` → Tailwind CSS classes
- `TouchableOpacity` → `button` or custom component

### 3. Styling System

**From:** React Native StyleSheet with theme object  
**To:** Tailwind CSS with CSS variables

**Example:**
```tsx
// Before
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: THEME.card }
});
<View style={styles.container}>

// After
<div className="p-4 bg-card">
```

### 4. Authentication

**From:** `@clerk/clerk-expo`  
**To:** `@clerk/nextjs`

**Changes:**
- Server components use `auth()` from `@clerk/nextjs/server`
- Client components use hooks from `@clerk/nextjs`
- Middleware for route protection

### 5. Navigation

**From:** `expo-router` with `useRouter`  
**To:** `next/navigation` with `useRouter` and `Link`

**Example:**
```tsx
// Before
import { useRouter } from 'expo-router';
router.navigate('(home)');

// After
import { useRouter } from 'next/navigation';
import Link from 'next/link';
router.push('/');
<Link href="/">Home</Link>
```

## Installation & Setup

### 1. Install Dependencies

```bash
# Install Next.js dependencies
npm install next react react-dom

# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/app @capacitor/status-bar @capacitor/keyboard

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install updated Clerk
npm install @clerk/nextjs

# Install UI libraries
npm install clsx tailwind-merge
npm install lucide-react @radix-ui/react-icons
```

### 2. Configuration Files

All configuration files have been created:
- ✅ `next.config.js` - Next.js configuration with webpack aliases
- ✅ `tailwind.config.ts` - Tailwind with theme variables
- ✅ `postcss.config.js` - PostCSS for Tailwind
- ✅ `capacitor.config.ts` - Capacitor app configuration
- ✅ `tsconfig-nextjs.json` - TypeScript config for Next.js

### 3. Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 4. Initialize Capacitor

```bash
npx cap init
npx cap add ios
npx cap add android
```

### 5. Run Development Server

```bash
npm run dev          # Start Next.js dev server
npm run convex:dev   # Start Convex dev server (in another terminal)
```

### 6. Build for Mobile

```bash
npm run build        # Build Next.js app
npx cap sync         # Sync web build to native projects
npx cap open ios     # Open in Xcode
npx cap open android # Open in Android Studio
```

## Migration Status

### ✅ Completed

- [x] Next.js project structure
- [x] Capacitor configuration
- [x] Core UI components library
- [x] Tailwind CSS setup
- [x] Convex provider
- [x] Clerk authentication provider
- [x] Basic routing structure
- [x] Sign in screen (example migration)
- [x] Sign out button (example migration)
- [x] Dashboard screen (example migration)

### 🔄 In Progress

- [ ] Complete screen migrations
- [ ] Convert all React Native components
- [ ] Update shared components
- [ ] Migrate hooks
- [ ] Mobile-specific features (camera, haptics)

### ⏳ Pending

- [ ] Diary screen
- [ ] Stats screen
- [ ] Plan screen
- [ ] Profile screen
- [ ] Workout screen
- [ ] Custom workout screen
- [ ] All shared components
- [ ] Native module integrations

## Component Migration Examples

### Example 1: Simple Screen

**Before (React Native):**
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/shared/theme/colours';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: THEME.background },
  title: { fontSize: 24, color: THEME.text }
});
```

**After (Next.js):**
```tsx
'use client';

import { View, Text } from '@/lib/ui/components';

export default function MyScreen() {
  return (
    <View className="p-4 bg-background">
      <Text variant="h1" className="text-2xl text-text">Hello</Text>
    </View>
  );
}
```

### Example 2: Navigation

**Before:**
```tsx
import { useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

function MyComponent() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.navigate('(home)')}>
      <Text>Go Home</Text>
    </TouchableOpacity>
  );
}
```

**After:**
```tsx
'use client';

import Link from 'next/link';
import { Button } from '@/lib/ui/components';

function MyComponent() {
  return (
    <Link href="/">
      <Button>Go Home</Button>
    </Link>
  );
}
```

## Mobile Considerations

### Native Features

Some Expo features need alternatives:

1. **Camera/Image Picker:**
   - Web: `<input type="file" accept="image/*">`
   - Mobile: Capacitor Camera plugin

2. **Haptics:**
   - Web: Not available
   - Mobile: Capacitor Haptics plugin (if needed)

3. **Safe Area:**
   - Use CSS `env()` variables
   - Or custom `SafeAreaView` component

### Platform Detection

```tsx
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const isIOS = Capacitor.getPlatform() === 'ios';
const isAndroid = Capacitor.getPlatform() === 'android';
```

## Testing

### Web Testing
```bash
npm run dev
# Open http://localhost:3000
```

### Mobile Testing
```bash
npm run build
npx cap sync
npx cap open ios      # Test on iOS simulator
npx cap open android  # Test on Android emulator
```

## Deployment

### Web Deployment
- Vercel (recommended for Next.js)
- Netlify
- Any static hosting with Next.js support

### Mobile Deployment
- iOS: Build via Xcode → App Store
- Android: Build via Android Studio → Google Play Store

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Convex Documentation](https://docs.convex.dev)

## Support

For migration issues:
1. Check `MIGRATION_GUIDE.md` for detailed migration steps
2. Review `MIGRATION_SCRIPT.md` for execution steps
3. Compare migrated examples in `app-nextjs/` with originals in `app/`

## Next Steps

1. Complete screen migrations following the examples
2. Test all functionality on web
3. Test on iOS and Android
4. Handle platform-specific features
5. Optimize for mobile performance
6. Deploy to production
