import { useEffect, useState, useRef } from 'react'; // *** FIXED: Added useRef import ***
import { View, FlatList, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import CourseCard from '../../components/courseCard';
import CourseForm from '../../components/courseForm';
import { useAuth } from '../../_context/AuthContext';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking'; 
import { useLocalSearchParams } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const CourseScreen = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const [adminMode, setAdminMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // *** FIXED: Get course ID from route parameters and handle properly ***
  const { id: selectedCourseId } = useLocalSearchParams();
  const [highlightedCourseId, setHighlightedCourseId] = useState(null);
  const flatListRef = useRef(null); // *** FIXED: Properly initialize useRef ***

  const fetchCourses = async () => {
    try {
      const headers = token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        : {
            'Content-Type': 'application/json',
          };

      const query = searchTerm ? `?location.suburb=${encodeURIComponent(searchTerm)}` : "";
      const res = await fetch(`${API_BASE_URL}/courses${query}`, { headers });
      const data = await res.json();
      setCourses(data);
      
      // *** FIXED: Handle course ID highlighting and scrolling properly ***
      if (selectedCourseId && data.length > 0) {
        // Convert selectedCourseId to string for comparison (route params are strings)
        const courseIdToFind = String(selectedCourseId);
        setHighlightedCourseId(courseIdToFind);
        
        // Find the index of the selected course
        const courseIndex = data.findIndex(course => String(course._id) === courseIdToFind);
        
        if (courseIndex !== -1) {
          // Scroll to the course after a short delay to ensure the list is rendered
          setTimeout(() => {
            if (flatListRef.current) {
              try {
                flatListRef.current.scrollToIndex({
                  index: courseIndex,
                  animated: true,
                  viewPosition: 0.3,
                });
              } catch (error) {
                console.log('Scroll to index failed, using alternative method');
                // Fallback: scroll to offset
                flatListRef.current.scrollToOffset({
                  offset: courseIndex * 200, // Approximate item height
                  animated: true,
                });
              }
            }
          }, 500);
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedCourseId(null);
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCourseId]); // *** FIXED: Added selectedCourseId as dependency ***

  const handleShareAllCourses = async () => {
    // Generate a deep link to open the app to the /courses screen
    const url = Linking.createURL('/course');
    await Clipboard.setStringAsync(url);
    Alert.alert("Copied", `Link copied:\n${url}`);
  };

  const handleSearch = async () => {
    setLoading(true);
    setHighlightedCourseId(null);
    await fetchCourses();
  };

  const clearSearch = () => {
    setSearchTerm("");
    setLoading(true);
    fetchCourses();
  };

  const deleteCourse = async (courseId) => {
    if (!user?.is_admin) return;

    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert("Success", "Course deleted successfully");
                fetchCourses();
              } else {
                Alert.alert("Error", "Failed to delete course");
              }
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert("Error", "Could not delete course");
            }
          }
        }
      ]
    );
  };

  const handleCoursePress = (course) => {
    if (adminMode) {
      setEditingCourse(course);
    }
  };

  // *** FIXED: Improved error handling for scroll failures ***
  const onScrollToIndexFailed = (info) => {
    console.log('Scroll to index failed:', info);
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      if (flatListRef.current && info.index < courses.length) {
        try {
          flatListRef.current.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.3,
          });
        } catch (error) {
          // Final fallback: scroll to offset
          flatListRef.current.scrollToOffset({
            offset: info.index * 200,
            animated: true,
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#117a65" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {adminMode ? "Manage Courses" : "Available Courses"}
        </Text>

        <TouchableOpacity onPress={handleShareAllCourses} style={{alignItems:'center'}}>
          <Text style={{ margin:2, color: 'black', fontWeight: 'bold' }}>
            Share
          </Text>
          <Image
            source={require('../../assets/icons/share-icon.png')}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {user?.is_admin && (
          <TouchableOpacity
            style={[styles.adminButton, adminMode && styles.adminButtonActive]}
            onPress={() => setAdminMode(!adminMode)}
          >
            <Text style={[styles.adminButtonText, adminMode && styles.adminButtonTextActive]}>
              {adminMode ? "Exit Admin" : "Admin Mode"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {adminMode && (
        <View style={styles.adminControls}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setEditingCourse({})}
          >
            <Text style={styles.createButtonText}>+ Create New Course</Text>
          </TouchableOpacity>
        </View>
      )}

      {editingCourse !== null && (
        <CourseForm
          course={Object.keys(editingCourse).length === 0 ? null : editingCourse}
          onSuccess={() => {
            setEditingCourse(null);
            fetchCourses();
          }}
          onCancel={() => setEditingCourse(null)}
        />
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by suburb..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={courses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            isAdmin={user?.is_admin}
            adminMode={adminMode}
            onPress={() => handleCoursePress(item)}
            onDelete={() => deleteCourse(item._id)}
            isHighlighted={String(item._id) === highlightedCourseId} // *** FIXED: Ensure string comparison ***
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No courses found</Text>}
        onScrollToIndexFailed={onScrollToIndexFailed}
        getItemLayout={(data, index) => (
          {length: 200, offset: 200 * index, index}
        )}
        // *** ADDED: Additional props for better performance ***
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#117a65',
  },
  adminButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#117a65',
  },
  adminButtonActive: {
    backgroundColor: '#117a65',
  },
  adminButtonText: {
    color: '#117a65',
    fontWeight: '600',
  },
  adminButtonTextActive: {
    color: 'white',
  },
  adminControls: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  createButton: {
    backgroundColor: '#117a65',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: '#117a65',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});

export default CourseScreen;