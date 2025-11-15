import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { tokenCache } from '@clerk/clerk-expo/token-cache'


import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo"
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";


import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import React  from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || '';
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';


const convex = new ConvexReactClient(CONVEX_URL, {
  // We're not using authentication in this example.
  // We'll rely on the default anonymous authentication.
  unsavedChangesWarning: false,
});


const RootLayout = () => {

  const { user } = useUser();

  return (
    <>
      <Stack>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!(!!user)}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const RootLayoutWithProviders = () => {
  const colorScheme = useColorScheme();
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootLayout />
          </ThemeProvider>
        </SafeAreaProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

export default RootLayoutWithProviders
