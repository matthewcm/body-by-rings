# Migration Execution Script

## Quick Start

1. **Backup your current code:**
   ```bash
   git add .
   git commit -m "Before Next.js migration"
   ```

2. **Install Next.js dependencies:**
   ```bash
   # Merge package-nextjs.json into package.json
   # Or rename: mv package.json package-expo.json && mv package-nextjs.json package.json
   npm install
   ```

3. **Copy configuration files:**
   - `next.config.js` ✅ Already created
   - `tailwind.config.ts` ✅ Already created
   - `capacitor.config.ts` ✅ Already created
   - Update `tsconfig.json` or use `tsconfig-nextjs.json`

4. **Set up Capacitor:**
   ```bash
   npm install @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
   npm install @capacitor/app @capacitor/status-bar @capacitor/keyboard
   npx cap init
   npx cap add ios
   npx cap add android
   ```

5. **Copy app structure:**
   ```bash
   # Backup old app
   mv app app-expo-backup
   # Use new structure
   mv app-nextjs app
   ```

6. **Update environment variables:**
   ```bash
   # Copy .env.example and update with your values
   # NEXT_PUBLIC_CONVEX_URL=your_convex_url
   # NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   # CLERK_SECRET_KEY=your_clerk_secret
   ```

7. **Test the build:**
   ```bash
   npm run build
   npm run dev
   ```

8. **Sync Capacitor:**
   ```bash
   npm run build
   npx cap sync
   ```

## File Migration Checklist

### Configuration Files ✅
- [x] `next.config.js`
- [x] `tailwind.config.ts`
- [x] `postcss.config.js`
- [x] `capacitor.config.ts`
- [x] `tsconfig-nextjs.json`

### Core App Files
- [x] `app-nextjs/layout.tsx` (Root layout)
- [x] `app-nextjs/globals.css` (Global styles)
- [x] `app-nextjs/page.tsx` (Home page)
- [x] `lib/convex-provider.tsx`
- [x] `lib/ui/components.tsx` (UI components)
- [x] `lib/utils.ts`

### Features to Migrate
- [ ] Sign In Screen
- [ ] Sign Up Screen
- [ ] Dashboard Screen
- [ ] Diary Screen
- [ ] Stats Screen
- [ ] Plan Screen
- [ ] Profile Screen
- [ ] Workout Screen
- [ ] Custom Workout Screen

### Shared Components
- [ ] Sign Out Button
- [ ] Muscle Map
- [ ] WOD Scanner
- [ ] Theme Text/View
- [ ] External Link
- [ ] All other shared components

## Next Steps After Basic Setup

1. **Migrate each screen one by one:**
   - Start with auth screens (sign-in, sign-up)
   - Then dashboard
   - Then other main screens

2. **Update imports:**
   - Replace `expo-router` imports with `next/navigation`
   - Replace `@clerk/clerk-expo` with `@clerk/nextjs`
   - Replace React Native components with web equivalents

3. **Convert styling:**
   - Replace `StyleSheet.create()` with Tailwind classes
   - Update theme references to CSS variables

4. **Test mobile:**
   - Build and test on iOS
   - Build and test on Android
   - Test native features (camera, etc.)

## Rollback Plan

If you need to rollback:
```bash
mv app app-nextjs
mv app-expo-backup app
# Restore original package.json
npm install
```
