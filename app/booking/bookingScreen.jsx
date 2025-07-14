import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import BookingItem from '../../components/bookingItem';
import { useAuth } from '../../_context/AuthContext';

const BookingScreen = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) {
      // User logged out: clear bookings
      setBookings([]);
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    fetchBookings();

    if (user?.is_admin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user, token]);


const fetchBookings = async () => {
  if (!token) return;
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 429) {
      const { error } = await response.json();
      alert(error);
      return;
    }

    const data = await response.json();
    setBookings(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
  } finally {
    setLoading(false);
  }
};

const toggleStatus = async (id) => {
  const booking = bookings.find(b => b._id === id);
  const newStatus = booking.status === 'Confirmed' ? 'Pending' : 'Confirmed';

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.status === 429) {
      const { error } = await response.json();
      alert(error);
      return;
    }

    fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteBooking = async (id) => {
  if (!isAdmin) {
    console.warn('Only administrators can delete bookings');
    return;
  }

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 429) {
      const { error } = await response.json();
      alert(error);
      return;
    }

    fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <BookingItem
            booking={item}
            onStatusChange={toggleStatus}
            onDelete={deleteBooking}
            isAdmin={isAdmin} // Pass the admin status to the BookingItem
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666'
  }
});

export default BookingScreen;