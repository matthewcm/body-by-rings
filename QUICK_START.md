# Quick Start: Next.js Migration

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
# Option A: Replace package.json
mv package.json package-expo-backup.json
mv package-nextjs.json package.json
npm install

# Option B: Merge dependencies manually
# Copy dependencies from package-nextjs.json into package.json
npm install
```

### 2. Set Up Configuration

```bash
# Copy TypeScript config (if needed)
cp tsconfig-nextjs.json tsconfig.json
# Or merge paths into existing tsconfig.json

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
CLERK_SECRET_KEY=your_clerk_secret_here
EOF
```

### 3. Activate Next.js Structure

```bash
# Backup old structure
mv app app-expo-backup

# Use new structure
mv app-nextjs app
```

### 4. Install Capacitor (Optional - for mobile)

```bash
npm install @capacitor/cli @capacitor/core
npm install @capacitor/ios @capacitor/android
npm install @capacitor/app @capacitor/status-bar @capacitor/keyboard

npx cap init
npx cap add ios
npx cap add android
```

### 5. Start Development

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Convex dev server
npm run convex:dev
```

Visit: http://localhost:3000

### 6. Test Build

```bash
npm run build
npm run start
```

## 📱 Mobile Build (After web works)

```bash
# Build Next.js
npm run build

# Sync to Capacitor
npx cap sync

# Open in native IDEs
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

## 🔄 Rollback (if needed)

```bash
# Restore Expo structure
mv app app-nextjs
mv app-expo-backup app

# Restore package.json
mv package.json package-nextjs.json
mv package-expo-backup.json package.json

# Reinstall
npm install
```

## ✅ What Works Now

- ✅ Next.js app structure
- ✅ Sign in page (basic)
- ✅ Dashboard (example)
- ✅ Tailwind CSS styling
- ✅ Convex integration
- ✅ Clerk authentication
- ✅ Core UI components

## ⚠️ What Needs Migration

- All remaining screens (diary, stats, plan, profile, workout)
- All shared components
- React Native specific features (camera, haptics, etc.)

## 📚 Next Steps

1. Test the basic setup (sign in, dashboard)
2. Migrate remaining screens one by one
3. Test on web
4. Test on mobile (iOS/Android)
5. Deploy to production

## 🆘 Troubleshooting

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
```

**Module not found errors:**
- Check that `app-nextjs` is renamed to `app`
- Verify imports use `@/` paths
- Check `tsconfig.json` paths configuration

**Capacitor errors:**
- Run `npx cap sync` after each build
- Ensure `webDir` in `capacitor.config.ts` matches Next.js output directory

## 📖 Full Documentation

- `MIGRATION_GUIDE.md` - Detailed migration guide
- `MIGRATION_SCRIPT.md` - Step-by-step execution
- `README_MIGRATION.md` - Complete reference
- `MIGRATION_SUMMARY.md` - Current status
