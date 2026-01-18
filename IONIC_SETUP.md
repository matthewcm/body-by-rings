# Ionic Framework Integration

This project is structured following the [Next.js + Tailwind + Ionic + Capacitor starter template](https://github.com/mlynch/nextjs-tailwind-ionic-capacitor-starter).

## Architecture

### Static Export Mode
- **Next.js is configured for static export** (`output: 'export'` in `next.config.js`)
- All pages are built as static HTML/CSS/JS
- No Server-Side Rendering (SSR) or Server-Side Generation (SSG)
- This is required for Capacitor to package the app for iOS/Android

### Routing
- **Ionic React Router** handles all navigation within the app
- Next.js routing is minimal - used primarily for the build process
- All screens are defined in `components/AppShell.tsx` using Ionic Router
- Routes are client-side only

### Components Structure
- **Ionic Components**: Use `@ionic/react` for cross-platform UI components
- **Tailwind CSS**: Used for styling and responsive design
- **Custom Components**: Located in `lib/ui/components.tsx` and `features/`

## Development Workflow

### Web Development
```bash
npm run dev
```
- Runs Next.js dev server at `http://localhost:3000`
- Hot reload enabled
- Perfect for web development and testing

### Building for Mobile
```bash
# Build static export
npm run build

# Sync to Capacitor native projects
npm run sync
```

### Running on Native Platforms
```bash
# iOS
npm run ios

# Android
npm run android
```

### Live Reload (Development)
To enable live reload during development on a physical device:

1. Find your local IP address (e.g., `192.168.1.2`)
2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.1.2:3000',
   }
   ```
3. Run `npm run sync` to update native projects
4. Start dev server: `npm run dev`
5. Open in native app - changes will hot reload

## Key Files

### `components/AppShell.tsx`
- Main app shell component
- Handles authentication (Clerk)
- Sets up Ionic Router and tabs navigation
- Wraps all screens with Ionic components

### `app/layout.tsx`
- Root layout component
- Includes Ionic CSS imports via `globals.css`
- Sets up providers (Clerk, Convex)

### `app/globals.css`
- Tailwind CSS imports
- Ionic Framework CSS imports
- Custom CSS variables for theming

### `capacitor.config.ts`
- Capacitor configuration
- Points to `out/` directory (Next.js export output)
- Native plugin configurations

## Important Notes

### No SSR/SSG
- All rendering is client-side
- SEO is limited (acceptable for mobile apps)
- Initial HTML is minimal shell
- JavaScript handles all rendering

### Image Optimization
- Images must be unoptimized (`unoptimized: true` in `next.config.js`)
- Use standard `<img>` tags or Capacitor plugins for native image handling

### API Routes
- API Routes can be used but require special configuration
- For mobile builds, prefer client-side data fetching (Convex, etc.)

### Ionic Components vs Custom
- Use Ionic components (`IonButton`, `IonCard`, etc.) for native-like UI
- Use Tailwind + custom components for specific styling needs
- Mix both as needed for best cross-platform experience

## Styling Guidelines

1. **Ionic CSS Variables**: Use Ionic's CSS variables for theming
2. **Tailwind Utilities**: Use Tailwind classes for layout and spacing
3. **Custom CSS Variables**: Defined in `globals.css` for app-specific theming
4. **Responsive Design**: Use Tailwind's responsive utilities (`sm:`, `md:`, `lg:`)

## Mobile Considerations

### Viewport
- Set in `app/layout.tsx`: `viewport-fit=cover` for notched devices
- Dark mode support via `color-scheme: dark`

### Native Features
- Use Capacitor plugins for camera, geolocation, etc.
- Check platform with `Capacitor.getPlatform()`
- Handle permissions properly

### Performance
- Static export = fast load times
- Code splitting happens automatically
- Optimize images and assets for mobile

## Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables (Clerk, Convex)
3. Run `npm run dev` for web development
4. When ready for mobile: `npm run build && npm run sync`
5. Open in Xcode/Android Studio: `npm run ios` or `npm run android`

For more details, see the [starter template documentation](https://github.com/mlynch/nextjs-tailwind-ionic-capacitor-starter).
