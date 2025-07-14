import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { AuthProvider } from '../_context/AuthContext';
import { NotificationProvider } from '../_context/NotificationContext';


const RootLayout = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#117a65' },
          headerTintColor: 'white',
          tabBarActiveTintColor: '#117a65',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="course"
          options={{
            title: 'Yoga Courses',
            tabBarLabel: 'Courses',
            tabBarIcon: ({ color, size }) => (
              <Image source={require('../assets/icons/course-icon.jpg')}
              style={{ width: size, height: size,}}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="booking"
          options={{
            title: 'Booking',
            tabBarLabel: 'Booking',
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('../assets/icons/booking-icon.png')}
                style={{ width: size, height: size, tintColor: color }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('../assets/icons/profile-icon.png')}
                style={{ width: size, height: size, tintColor: color }}
              />
            ),
          }}
        />
      </Tabs>
    </AuthProvider>
    </NotificationProvider>    
  );
}

export default RootLayout;