// Catch-all route for Ionic Router
// This allows Next.js to handle all routes and pass them to Ionic Router
// Note: This must be a server component (no 'use client') to use generateStaticParams
export default function RoutesPage() {
  return null;
}

// Static export configuration
export const dynamicParams = false;
export const dynamic = 'force-static';

// Generate static params for static export
// Required when using "output: export" with catch-all dynamic routes
export function generateStaticParams() {
  return [
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
