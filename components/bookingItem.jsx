import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const BookingItem = ({ booking, onStatusChange, onDelete, isAdmin }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.courseName}>{booking.bookingCourse?.name || 'Unnamed Course'}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: booking.status === 'Confirmed' ? '#4CAF50' : '#FFC107' }
        ]}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{booking.bookingCourse?.time}</Text>
      </View>
      
      {booking.bookingCourse?.location && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{booking.bookingCourse.location.suburb || 'Not specified'}</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.statusButton]} 
          onPress={() => onStatusChange(booking._id)}
        >
          <Text style={styles.buttonText}>
            {booking.status === 'Confirmed' ? 'Mark as Pending' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
        
        {isAdmin && (
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={() => onDelete(booking._id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10
  },
  statusText: {
    color: 'white',
    fontWeight: '120',
    fontSize: 12
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  label: {
    fontWeight: '600',
    width: 100,
    color: '#666'
  },
  value: {
    flex: 1,
    color: '#333'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin:5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusButton: {
    backgroundColor: '#117a65',
    flex: 2,
    marginRight: 2,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flex: 1
  },
  buttonText: {
    color: 'white',
    fontWeight: '600'
  }
});

export default BookingItem;