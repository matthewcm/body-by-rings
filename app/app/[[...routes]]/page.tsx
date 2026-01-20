// This catch-all route handles all app navigation through Ionic Router
// Based on the Next.js + Ionic + Capacitor starter template pattern
export default function AppRoutes() {
  return null; // AppShell handles all routing (rendered in layout)
}

// Static export configuration
export const dynamicParams = false;
export const dynamic = 'force-static';

// Generate static params for static export
// Required when using "output: export" with catch-all dynamic routes
// For [[...routes]], return an array with a 'routes' property containing path segments
export function generateStaticParams() {
  return [
    { routes: [] }, // Root path
    { routes: ['diary'] },
    { routes: ['plan'] },
    { routes: ['stats'] },
    { routes: ['profile'] },
    { routes: ['custom-workout'] },
    // Common workout routes
    { routes: ['workout', '1', '1'] },
    { routes: ['workout', '1', '2'] },
    { routes: ['workout', '1', '3'] },
  ];
}
