import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.username.bodybyringsapp',
  appName: 'BodyByRingsApp',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Uncomment and set your local IP for live reload during development
    // url: 'http://192.168.1.2:3000',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#121212',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
