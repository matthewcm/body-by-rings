import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import React from 'react';
import { authStyles } from './auth-styles'; // Assuming styles are in the same directory

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Sign In Failed", "Please follow the next steps to complete your sign-in.");
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Sign In Error", err.errors?.[0]?.message || "An error occurred during sign-in.");
    }
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Welcome Back</Text>
      <Text style={authStyles.subtitle}>Sign in to continue your journey</Text>
      
      <View style={authStyles.inputContainer}>
        <TextInput
          style={authStyles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#6E6E6E"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        />
      </View>

      <View style={authStyles.inputContainer}>
        <TextInput
          style={authStyles.input}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#6E6E6E"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
      </View>

      <TouchableOpacity style={authStyles.button} onPress={onSignInPress}>
        <Text style={authStyles.buttonText}>Continue</Text>
      </TouchableOpacity>
      
      <View style={authStyles.footer}>
        <Text style={authStyles.footerText}>Don't have an account?</Text>
        <Link href="/sign-up" asChild>
          <Text style={authStyles.footerLink}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}


