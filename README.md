# 💪 Body by Rings

> A comprehensive workout tracking application designed for structured phase-based training programs, with AI-powered features and detailed progress analytics.

**🌐 Live Application:** [https://rings.matthewcm.dev/](https://rings.matthewcm.dev/)

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

#### **Workout Execution**
- Real-time workout logging with sets, reps, and intensity tracking
- Pre-filled templates based on previous performance
- Exercise notes and modifications
- Workout summary with performance overview

#### **Custom Workouts**
- Create ad-hoc workouts outside of structured programs
- Add custom exercises to your catalog
- Flexible workout structure

### 🤖 AI-Powered Features

#### **WOD Board Scanner**
- **Camera Integration**: Scan CrossFit-style WOD boards directly from your device
- **Gallery Upload**: Process saved images of workout boards
- **AI Analysis**: Automatically extracts exercises, rep schemes, and time caps
- **Smart Parsing**: Distinguishes between strength movements and WODs/Metcons
- Powered by Google Gemini AI

### 📊 Progress Tracking

#### **Workout Diary**
- Calendar view of completed workouts
- Daily activity tracking
- Performance metrics and trends
- Muscle usage visualization

#### **Statistics & Analytics**
- Progression tables for exercises
- Performance charts over time
- Muscle group engagement analysis
- Historical workout data

### 🗺️ Muscle Mapping

- **Interactive Skeleton Visualization**: See which muscle groups are targeted by each exercise
- **Workout Summary Integration**: Visual representation of muscle engagement in completed workouts
- **Exercise Catalog**: Comprehensive database with muscle group associations

### 📱 Cross-Platform Support

- **Web Application**: Full-featured web experience
- **Mobile Apps**: Native iOS and Android apps via Capacitor
- **Responsive Design**: Optimized for all screen sizes

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
│   ├── custom-workout-screen/  # Custom workout creation
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

1. **Complete Feature Migration**
   - [ ] Finalize remaining screen migrations from Expo
   - [ ] Ensure all React Native components are converted
   - [ ] Complete shared component updates

2. **Mobile Optimization**
   - [ ] Test and optimize camera functionality on iOS/Android
   - [ ] Implement platform-specific features (haptics, native modules)
   - [ ] Optimize performance for mobile devices

3. **Testing & Quality Assurance**
   - [ ] Comprehensive testing of all features on web
   - [ ] Mobile device testing (iOS and Android)
   - [ ] Cross-browser compatibility verification

4. **Enhancements**
   - [ ] Improve AI scanning accuracy and error handling
   - [ ] Add more exercise templates to catalog
   - [ ] Enhance statistics and analytics features
   - [ ] Implement workout sharing capabilities

5. **Documentation**
   - [ ] User guide and tutorials
   - [ ] API documentation
   - [ ] Deployment guides

6. **Production Readiness**
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

This project is private and proprietary.

---

## 🔗 Links

- **Live Application**: [https://rings.matthewcm.dev/](https://rings.matthewcm.dev/)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Convex Documentation**: [https://docs.convex.dev](https://docs.convex.dev)
- **Clerk Documentation**: [https://clerk.com/docs](https://clerk.com/docs)

---

**Built with ❤️ for fitness enthusiasts**
