# 💪 Body by Rings

> A comprehensive workout tracking application designed for structured phase-based training programs, with AI-powered features and detailed progress analytics.

**🌐 Live Application:** [https://rings.matthewcm.dev/](https://rings.matthewcm.dev/)

---

## 🆕 What's New

### Latest Features

- **🎯 Previous Performance Tracking**: Quick access to exercise history with info icon - view 1RM, best efforts, and performance trends
- **🏆 Personal Best Marking**: Mark sets as PB during workouts to track achievements
- **📊 1RM Calculator**: Automatic one-rep max estimation using the Epley formula
- **🤖 Enhanced WOD Scanner**: Improved UI with individual loading states, cancel functionality, and auto-fill from rep schemes
- **⚡ Smart Rep Scheme Parsing**: Automatically creates sets from scanned WOD rep schemes (21-15-9, 5x5, etc.)
- **🗺️ Universal Muscle Mapping**: Muscle visualization now works for all exercises with intelligent name matching
- **✨ Desktop Experience**: Mobile first but scaled also for Desktop

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Next Steps](#next-steps)
- [Contributing](#contributing)

---

## 🎯 Overview

**Body by Rings** is a modern, full-stack workout tracking application built for athletes and fitness enthusiasts following structured training programs. The app specializes in phase-based programming (inspired by "Body by Rings" methodology) and provides comprehensive tools for workout planning, execution, and progress tracking.

### Purpose

The application helps users:
- **Follow structured training phases** with day-by-day workout templates
- **Track workout performance** with detailed logging of sets, reps, intensity, and notes
- **Analyze progress** through comprehensive statistics and visualizations
- **Create custom workouts** or scan WOD boards using AI
- **Visualize muscle engagement** with interactive muscle mapping
- **Maintain a workout diary** with calendar views and performance metrics

---

## 🛠 Technologies

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router for web-first development
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Ionic React](https://ionicframework.com/react)** - Mobile-optimized UI components

### Backend & Database
- **[Convex](https://www.convex.dev/)** - Real-time backend with built-in database
- **[Clerk](https://clerk.com/)** - Authentication and user management

### Mobile
- **[Capacitor](https://capacitorjs.com/)** - Native mobile app runtime (iOS & Android)
- **[Capacitor Camera](https://capacitorjs.com/docs/apis/camera)** - Native camera integration

### AI & Analytics
- **[Google Generative AI (Gemini)](https://ai.google.dev/)** - AI-powered WOD board scanning
- **[React Body Highlighter](https://www.npmjs.com/package/react-body-highlighter)** - Interactive muscle mapping visualization

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Netlify** - Deployment platform

---

## ✨ Key Features

### 🏋️ Workout Management

#### **Phase-Based Programming**
- Structured workout programs organized by phases and days
- Easy navigation through training phases
- Program creation and customization
- Active program tracking

#### **Workout Execution** ⭐ *Enhanced*
- Real-time workout logging with sets, reps, and intensity tracking
- Pre-filled templates based on previous performance
- **Previous Performance Tracking**: Quick access to exercise history via info icon
- **Personal Best Marking**: Mark sets as PB (Personal Best) for tracking achievements
- **1RM Calculations**: Automatic estimation of one-rep max from your sets
- Exercise notes and modifications
- Workout summary with performance overview

#### **Custom Workouts** ⭐ *Enhanced*
- Create ad-hoc workouts outside of structured programs
- **WOD Scanner Integration**: Scan and auto-populate workouts from WOD boards
- **Auto-Fill from Scans**: Rep schemes automatically create sets (e.g., "21-15-9" → 3 sets)
- Add custom exercises to your catalog
- Flexible workout structure
- Previous performance tracking and PB marking available

### 🤖 AI-Powered Features

#### **WOD Board Scanner** ⭐ *Enhanced*
- **Camera Integration**: Scan CrossFit-style WOD boards directly from your device
- **Gallery Upload**: Process saved images of workout boards
- **AI Analysis**: Automatically extracts exercises, rep schemes, and time caps
- **Smart Parsing**: Distinguishes between strength movements and WODs/Metcons
- **Intelligent Auto-Fill**: Automatically populates sets and reps from scanned rep schemes (e.g., "21-15-9" creates 3 sets with those reps)
- **Enhanced UX**: Individual button loading states, cancel functionality, and seamless scanning experience
- **Rep Scheme Recognition**: Supports multiple formats (21-15-9, 5x5, single numbers, rounds)
- Powered by Google Gemini AI

### 📊 Progress Tracking

#### **Workout Diary**
- Calendar view of completed workouts
- Daily activity tracking
- Performance metrics and trends
- Muscle usage visualization

#### **Statistics & Analytics** ⭐ *Enhanced*
- Progression tables for exercises
- Performance charts over time
- Muscle group engagement analysis
- Historical workout data
- **Previous Performance Modal**: Detailed view of exercise history including:
  - Estimated 1RM (One Rep Max) calculations
  - Best efforts (reps, intensity, volume)
  - Most recent performance summary
  - Historical workout timeline

### 🗺️ Muscle Mapping ⭐ *Enhanced*

- **Interactive Skeleton Visualization**: See which muscle groups are targeted by each exercise
- **Universal Support**: Works for both custom and standard exercises with intelligent name matching
- **Smart Matching**: Handles exercise name variations (case differences, plurals) automatically
- **Workout Summary Integration**: Visual representation of muscle engagement in completed workouts
- **Exercise Catalog**: Comprehensive database with muscle group associations
- **Front & Back Views**: Dual visualization showing anterior and posterior muscle engagement

### 📱 Cross-Platform Support

- **Web Application**: Full-featured web experience
- **Mobile Apps**: Native iOS and Android apps via Capacitor
- **Responsive Design**: Optimized for all screen sizes
- **Seamless UX**: Custom scrollbar styling for desktop with thin, unobtrusive scrollbars

### 🎯 Performance Tracking Features ⭐ *New*

#### **Previous Performance Insights**
- **Info Icon Indicator**: Visual indicator (ℹ️) appears next to exercises with previous records
- **Quick Access Modal**: Tap the info icon to view comprehensive performance history
- **Best Efforts Display**: See your best 1RM, max reps, best intensity, and best volume
- **Historical Timeline**: Review your last 5 workouts for each exercise
- **Smart Exercise Matching**: Handles exercise name variations automatically

#### **Personal Best Tracking**
- **PB Marking**: Mark any set as a Personal Best during workout entry
- **Visual Highlighting**: PB sets are highlighted with primary color for easy identification
- **Achievement Tracking**: Track your progress and celebrate new personal records

#### **1RM Calculator**
- **Automatic Calculation**: Estimates one-rep max using the Epley formula
- **Best 1RM Tracking**: Tracks your best estimated 1RM across all workouts
- **Formula**: `weight × (1 + reps / 30)` for accurate strength estimation

---

## 📁 Project Structure

```
body-by-rings/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx           # Home/dashboard page
│   └── [...routes]/       # Dynamic routing
├── components/            # Shared React components
│   └── AppShell.tsx       # Main app shell/navigation
├── features/              # Feature-based screen modules
│   ├── dashboard-screen/  # Main dashboard with phase selection
│   ├── workout-screen/    # Workout execution interface
│   │   └── components/
│   │       ├── previous-performance-modal.tsx  # Performance history modal
│   │       └── exercise-card.tsx  # Exercise card with PB marking
│   ├── custom-workout-screen/  # Custom workout creation
│   │   └── components/
│   │       ├── wod-scanner-buttons.tsx  # Enhanced scanner UI
│   │       ├── wod-image-handler.tsx  # Image selection utility
│   │       └── rep-scheme-parser.tsx  # Rep scheme parsing
│   ├── diary-screen/      # Workout diary and calendar
│   ├── stats-screen/      # Progress statistics
│   ├── plan-screen/       # Program management
│   ├── profile-screen/    # User profile
│   └── ai-scanner/        # AI WOD scanning service
├── convex/                # Convex backend functions
│   ├── schema.ts          # Database schema
│   ├── workouts.ts        # Workout-related functions
│   ├── programs.ts         # Program management
│   ├── phases.ts          # Phase templates
│   └── ai.ts              # AI integration
├── lib/                   # Core utilities and providers
│   ├── convex-provider.tsx
│   ├── clerk-provider.ts
│   └── ui/                # Reusable UI components
├── shared/                # Shared components and utilities
│   ├── components/        # Cross-feature components
│   │   ├── muscle-map/    # Muscle mapping visualization
│   │   └── wod-scanner/   # WOD scanner UI
│   ├── models/            # Data models
│   └── utils/             # Utility functions
│       └── one-rm-calculator.ts  # 1RM calculation utilities
└── scripts/               # Development and migration scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Convex account and project
- Clerk account for authentication
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd body-by-rings
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development servers**
   
   Terminal 1 - Next.js:
   ```bash
   npm run dev
   ```
   
   Terminal 2 - Convex:
   ```bash
   npm run convex:dev
   ```

5. **Open the application**
   
   Visit [http://localhost:3000](http://localhost:3000)

### Mobile Development

To build for mobile platforms:

```bash
# Build Next.js app
npm run build

# Sync with Capacitor
npx cap sync

# Open in native IDEs
npm run ios      # Opens Xcode
npm run android  # Opens Android Studio
```

---

## 🎯 Next Steps

### Immediate Priorities

1. **Mobile Optimization**
   - [ ] Test and optimize camera functionality on iOS/Android
   - [ ] Implement platform-specific features (haptics, native modules)
   - [ ] Optimize performance for mobile devices

2. **Testing & Quality Assurance**
   - [ ] Comprehensive testing of all features on web
   - [ ] Mobile device testing (iOS and Android)
   - [ ] Cross-browser compatibility verification

3. **Enhancements**
   - [ ] Improve AI scanning accuracy and error handling
   - [ ] Add more exercise templates to catalog
   - [ ] Enhance statistics and analytics features
   - [ ] Implement workout sharing capabilities
   - [ ] Add PB notifications/celebrations

4. **Documentation**
   - [ ] User guide and tutorials
   - [ ] API documentation
   - [ ] Deployment guides

5. **Production Readiness**
   - [ ] Performance optimization
   - [ ] Security audit
   - [ ] Error tracking and monitoring
   - [ ] Analytics integration

### Long-term Roadmap

- **Social Features**: Share workouts, follow other users, community challenges
- **Advanced Analytics**: Machine learning-based progress predictions
- **Integration**: Connect with fitness wearables and other apps
- **Offline Support**: Full offline workout logging capability
- **Customization**: More theming options and personalization

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is a public dev showcase.
May make private if gaining users & increased running costs.

---

## 🔗 Links

- **Live Application**: [https://rings.matthewcm.dev/](https://rings.matthewcm.dev/)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Convex Documentation**: [https://docs.convex.dev](https://docs.convex.dev)
- **Clerk Documentation**: [https://clerk.com/docs](https://clerk.com/docs)

---

**Built with ❤️ for fitness enthusiasts**
