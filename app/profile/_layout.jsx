import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../_context/AuthContext';

export default function ProfileLayout() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#117a65' },
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: isAuthenticated ? `${user?.username}'s Profile` : 'Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Register',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}