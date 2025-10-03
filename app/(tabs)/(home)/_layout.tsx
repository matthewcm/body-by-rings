import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen name="index" options={{headerShown: false}} />
       {/* Hide the workout entry screen from the tab bar */}
      <Stack.Screen name="workout/[day]" options={{ href: null }} />
    </Stack>
  );
}
