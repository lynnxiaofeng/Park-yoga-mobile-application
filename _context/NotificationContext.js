import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect, useRef, createContext } from 'react';
import { Platform } from 'react-native';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      console.log("Expo Push Token:", token);
      // optionally save to backend
    });

    // Listen to incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Received:", notification);
    });

    // Handle tap on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification tapped:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return children;
};

async function registerForPushNotificationsAsync() {
  // if (!Device.isDevice) {
  //   alert('Must use physical device for Push Notifications');
  //   return;
  // }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export default NotificationProvider;