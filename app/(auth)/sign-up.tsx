import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { authStyles } from './auth-styles' // Assuming styles are in a shared file

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))

      const error = err as { errors?: { message: string }[] }
      Alert.alert("Sign Up Error", error.errors?.[0]?.message || "An error occurred during sign-up.");
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.navigate({pathname: '(home)'});
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
        Alert.alert("Verification Failed", "Please check the code and try again.");
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
      const error = err as { errors?: { message: string }[] }
      Alert.alert("Verification Error", error.errors?.[0]?.message || "An error occurred during verification.");
    }
  }

  return (
    <View style={authStyles.container}>
      {pendingVerification ? (
        <>
          <Text style={authStyles.title}>Verify Your Email</Text>
          <Text style={authStyles.subtitle}>A code has been sent to your email address.</Text>
          <View style={authStyles.inputContainer}>
            <TextInput
              style={authStyles.input}
              value={code}
              placeholder="Enter your verification code"
              placeholderTextColor="#6E6E6E"
              onChangeText={(code) => setCode(code)}
            />
          </View>
          <TouchableOpacity style={authStyles.button} onPress={onVerifyPress}>
            <Text style={authStyles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={authStyles.title}>Create Account</Text>
          <Text style={authStyles.subtitle}>Start your fitness journey today</Text>

          <View style={authStyles.inputContainer}>
            <TextInput
              style={authStyles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              placeholderTextColor="#6E6E6E"
              onChangeText={(email) => setEmailAddress(email)}
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

          <TouchableOpacity style={authStyles.button} onPress={onSignUpPress}>
            <Text style={authStyles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Already have an account?</Text>
            <Link href="/sign-in" asChild>
                <Text style={authStyles.footerLink}>Sign in</Text>
            </Link>
          </View>
        </>
      )}
    </View>
  )
}


