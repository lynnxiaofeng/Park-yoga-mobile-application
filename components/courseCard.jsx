import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { useAuth } from '../_context/AuthContext';
import { Link, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';


const CourseCard = ({ course, isAdmin, adminMode, onPress, onDelete, isHighlighted }) => { 
  const { token, user } = useAuth();
  const router = useRouter();

  const triggerBookingNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Booking Confirmed ✅",
      body: `You've booked "${course.name}" successfully!`,
    },
    trigger: { seconds: 1 },
    });
  };

  // *** Share individual course function ***
  const handleShareCourse = async () => {
    try {
      // Create a deep link to this specific course
      const courseUrl = Linking.createURL(`/course?id=${course._id}`);
      
      const shareContent = {
        message: `Check out this course: ${course.name}\n\nTime: ${course.time}\nLocation: ${course.location?.suburb || 'TBD'}\n\nOpen in app: ${courseUrl}`,
        url: courseUrl
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared via:', result.activityType);
        } else {
          // Shared
          console.log('Course shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing course:', error);
      Alert.alert('Error', 'Could not share course');
    }
  };

  const handleBooking = async () => {
    try {
      // Check if user is logged in
      if (!token) {
        Alert.alert(
          "Authentication Required",
          "Please log in to book this course",
          [{ text: "OK", onPress: () => router.push("/profile/login") }]
        );
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingCourse: course._id,
          status: "Confirmed",
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Booking error:', data);
        Alert.alert("Booking Failed", data.error || "Could not create booking");
        return;
      }

      triggerBookingNotification();
      Alert.alert(
        "Success",
        "Course booked successfully!",
        [{ text: "View Bookings", onPress: () => router.push("/booking/bookingScreen") }]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert("Error", "Could not create booking. Please try again.");
    }
  };

  // *** ADDED: Handle card press for admin mode ***
  const handleCardPress = () => {
    if (adminMode && isAdmin) {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        adminMode && isAdmin && styles.cardAdmin,
        isHighlighted && styles.cardHighlighted 
      ]}
      onPress={handleCardPress}
      activeOpacity={adminMode && isAdmin ? 0.7 : 1}
    >
      {adminMode && isAdmin && (
        <View style={styles.adminIndicator}>
          <Text style={styles.adminIndicatorText}>Tap to Edit</Text>
        </View>
      )}

      {isHighlighted && (
        <View style={styles.highlightIndicator}>
          <Text style={styles.highlightIndicatorText}>📍 From Recommendations</Text>
        </View>
      )}

            {/* *** NEW: Share button in top right corner *** */}
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShareCourse}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.shareButtonText}>📤</Text>
      </TouchableOpacity>

       <Text style={[
        styles.title,
        isHighlighted && styles.titleHighlighted // *** ADDED: Highlighted title styling ***
      ]}>
        {course.name}
      </Text>
      <Text style={styles.time}>Time: {course.time}</Text>
      <Text style={styles.description}>{course.description}</Text>
      <Text style={styles.location}>
        Suburb: {course.location?.suburb}
      </Text>
      
      {course.location?.link && (
        <Link style={styles.link} href={course.location?.link}>
          <Text style={styles.linkText}>{course.location?.link}</Text>
        </Link>
      )}
      
      {/* *** MODIFIED: Conditional rendering based on admin mode *** */}
      {adminMode && isAdmin ? (
        <View style={styles.adminButtonContainer}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleCardPress}
          >
            <Text style={styles.editButtonText}>Edit Course</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card press
              onDelete();
            }}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#117a65',
    marginVertical: 10,
    padding: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative', // *** ADDED: For admin indicator positioning ***
  },
  // *** ADDED: Admin mode card styling ***
  cardAdmin: {
    borderWidth: 2,
    borderColor: '#ffd700',
    backgroundColor: '#0f6b5c',
  },
  // *** ADDED: Admin indicator styles ***
  adminIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  adminIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 15,// *** MODIFIED: Added margin for admin indicator ***
    marginRight:40, //for share button
  },
  subtitle: {
    marginTop: 4,
    color: 'white',
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
    color: 'white',
  },
  time: {
    marginTop: 6,
    fontStyle: 'italic',
    color: 'white',
  },
  link: {
    marginTop: 5,
    marginBottom: 5,
  },
  linkText: {
    color: 'pink',
    textDecorationLine: 'underline',
  },
  location: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#FFFDD0',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 3,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },

  adminButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  editButton: {
    backgroundColor: '#ffd700',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
   cardHighlighted: {
    borderWidth: 3,
    borderColor: '#ff6b6b',
    backgroundColor: '#1a8c73',
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    transform: [{ scale: 1.02 }],
  },

  highlightIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
   highlightIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
   titleHighlighted: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
   shareButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  shareButtonText: {
    fontSize: 12,
  },
});

export default CourseCard;