import { authStyles } from '@/features/sign-in-screen/styles/auth-styles';
import { SignOutButton } from '@/shared/components/sign-out-button';
import { THEME } from '@/shared/theme/colours';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function OnboardScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.background }}>
      <View style={authStyles.container}>
        <SignedIn>
          {/* This view is typically handled by redirecting, but for completeness: */}
          <Text style={authStyles.title}>Welcome</Text>
          <SignOutButton />
        </SignedIn>

        <SignedOut>
          <View style={{ alignItems: 'center' }}>
            <Text style={authStyles.title}>Body By Rings</Text>
            <Text style={authStyles.subtitle}>Your ultimate workout companion. Sign in or create an account to get started.</Text>
          </View>

          <View style={{ marginTop: 40 }}>
            {/* Sign In Button */}
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity style={authStyles.button}>
                <Text style={authStyles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </Link>

            {/* Sign Up Button */}
            <Link href="/(auth)/sign-up" asChild>
              {/* Using ssoButton style for a secondary look */}
              <TouchableOpacity style={authStyles.ssoButton}>
                <Text style={authStyles.ssoButtonText}>Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SignedOut>
      </View>
    </SafeAreaView>
  );
}


