import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React from 'react';
import { THEME } from '@/theme/colours';


export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  
  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page after sign-out
      // Note: In Expo Router, you might prefer using router.replace('/')
      // instead of Linking for in-app navigation.
      Linking.openURL(Linking.createURL('/'))
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
      Alert.alert("Sign Out Error", "There was a problem signing out. Please try again.");
    }
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Text style={styles.text}>Sign Out</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.error, // Using the error color for a distinct look
    alignItems: 'center',
    alignSelf: 'center', // Makes the button only as wide as its content
  },
  text: {
    color: THEME.error, // Matching the text color to the border
    fontSize: 12,
    fontWeight: '600',
  },
});

