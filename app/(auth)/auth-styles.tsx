import { THEME } from "@/theme/colours";
import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  // Main container that centers the content
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    padding: 24,
  },
  // Large title for the screen (e.g., "Create Account")
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  // Subtitle text below the main title
  subtitle: {
    fontSize: 16,
    color: THEME.placeholder,
    textAlign: 'center',
  },
  // Container for each TextInput and its label
  inputContainer: {
    marginBottom: 16,
  },
  // Style for the text input fields
  input: {
    backgroundColor: THEME.card,
    color: THEME.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    fontSize: 16,
  },
  // Primary action button (e.g., "Sign Up")
  button: {
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  // Text inside the primary button
  buttonText: {
    color: THEME.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Style for secondary buttons like "Sign in with Google"
  ssoButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // Text for the SSO buttons
  ssoButtonText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  // Container for the text at the bottom (e.g., "Already have an account? Sign In")
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  // The static part of the footer text
  footerText: {
    color: THEME.placeholder,
    fontSize: 14,
  },
  // The tappable link part of the footer text
  footerLink: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

