import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking'; 
import { AppState } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const HomeLocationRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [userSuburb, setUserSuburb] = useState(null);
  const router = useRouter();
  const [manuallyRequested, setManuallyRequested] = useState(false);

  // Brisbane suburbs your API serves
  const BRISBANE_SUBURBS = ['Brisbane City', 'South Brisbane', 'Fortitude Valley', 'New Farm','East brisbane', 'Kangaroo point','Kelvin grove', 'South bank','Melbourne','Burnside heights'];
  const appState = useRef(AppState.currentState);
  const requestLocationAndFetchRecommendations = async () => {
    if (locationStatus === 'loading') return;
    
    setLoading(true);
    setLocationStatus('loading');

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationStatus('denied');
        // Show random recommendations as fallback
        if (manuallyRequested) {
        await fetchRandomRecommendations();
      }
        return;
      }

      setLocationStatus('granted');

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const userAddress = address[0];
        let detectedSuburb = userAddress.district || userAddress.subregion || userAddress.city;
        
        // Check if user is in one of your Brisbane suburbs
        const matchedSuburb = BRISBANE_SUBURBS.find(suburb => 
          detectedSuburb?.toLowerCase().includes(suburb.toLowerCase()) ||
          suburb.toLowerCase().includes(detectedSuburb?.toLowerCase())
        );

        setUserSuburb(matchedSuburb || detectedSuburb);
        
        // Fetch recommendations based on location
        await fetchLocationBasedCourses(matchedSuburb || detectedSuburb);
      }

    } catch (error) {
      console.error('Location error:', error);
      setLocationStatus('error');
      
      // Fallback: show random recommendations
      await fetchRandomRecommendations();
    } finally {
      setLoading(false);
    }
  };
  const fetchLocationBasedCourses = async (suburb) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);
    const allCourses = await response.json();
    
    let recommendedCourses = [];

    // Return early if suburb is not valid
    if (suburb && typeof suburb === 'string') {
      const sameSuburbCourses = allCourses.filter(course => 
        course.location?.suburb?.toLowerCase().includes(suburb.toLowerCase()) ||
        suburb.toLowerCase().includes(course.location?.suburb?.toLowerCase())
      );
      recommendedCourses = [...sameSuburbCourses];
    }

    // Continue fallback logic...
    if (recommendedCourses.length < 2) {
      const brisbaneCourses = allCourses.filter(course => 
        BRISBANE_SUBURBS.some(bSuburb => 
          course.location?.suburb?.toLowerCase().includes(bSuburb.toLowerCase())
        ) && !recommendedCourses.some(rec => rec._id === course._id)
      );
      recommendedCourses = [...recommendedCourses, ...brisbaneCourses];
    }

    if (recommendedCourses.length < 2) {
      const remainingCourses = allCourses.filter(course => 
        !recommendedCourses.some(rec => rec._id === course._id)
      );
      recommendedCourses = [...recommendedCourses, ...remainingCourses];
    }

    setRecommendations(recommendedCourses.slice(0, 2));

  } catch (error) {
    console.error('Error fetching location-based courses:', error);
    await fetchRandomRecommendations();
  }
};

  const fetchRandomRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      const allCourses = await response.json();
      
      // Get 2 random courses
      const shuffled = allCourses.sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 2));
    } catch (error) {
      console.error('Error fetching random recommendations:', error);
    }
  };

  const handleCoursePress = (course) => {
    // Navigate to course screen
    router.push(`/course?id=${course._id}`);
  };

 const handleEnableLocation = () => {
    setManuallyRequested(true);
    Alert.alert(
    "Enable Location Access",
    "To see courses near you, please allow location access in your device settings.",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openSettings(); // Opens the app's settings page
        }
      }
    ],
    { cancelable: true }
        );
    };

    useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // 🔁 Check and re-request location permission here
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        // ✅ Re-fetch user location
        const location = await Location.getCurrentPositionAsync({});
        // ✅ Re-fetch recommendations based on location
        fetchLocationBasedCourses(location);
      }
    }

    appState.current = nextAppState;
    });

    return () => {
    subscription.remove();
    };
    }, []);

  // Auto-load recommendations when component mounts
  useEffect(() => {
    requestLocationAndFetchRecommendations();
  }, []);

  if (loading && recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#117a65" />
        <Text style={styles.loadingText}>Finding courses near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {userSuburb && locationStatus === 'granted' 
            ? `Courses near ${userSuburb}` 
            : 'Recommended for You'
          }
        </Text>
        
        {locationStatus === 'denied' && (
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={handleEnableLocation}
          >
            <Text style={styles.locationButtonText}>📍 Enable Location</Text>
          </TouchableOpacity>
        )}
      </View>

      {recommendations.length > 0 ? (
        <View style={styles.coursesContainer}>
          {recommendations.map((course, index) => (
            <TouchableOpacity
              key={course._id}
              style={styles.courseCard}
              onPress={() => handleCoursePress(course)}
            >
              <Text style={styles.courseName} numberOfLines={1}>
                {course.name}
              </Text>
              <Text style={styles.courseSuburb}>
                📍 {course.location?.suburb}
              </Text>
              <Text style={styles.courseTime}>
                🕐 {course.time}
              </Text>
              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.noCoursesContainer}>
          <Text style={styles.noCoursesText}>No courses available at the moment</Text>
        </View>
      )}

      {locationStatus === 'denied' && (
        <Text style={styles.locationHint}>
          💡 Enable location to see courses near you
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#117a65',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationButton: {
    backgroundColor: '#117a65',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    color: '#117a65',
    marginTop: 10,
    textAlign: 'center',
  },
  coursesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: 350,
  },
  courseCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#117a65',
    marginBottom: 8,
  },
  courseSuburb: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  courseTime: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 12,
  },
   viewButton: {
    backgroundColor: '#117a65',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noCoursesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noCoursesText: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
  },
  locationHint: {
    color: '#6c757d',
    fontSize: 12,
    textAlign: 'bottom',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default HomeLocationRecommendations;