import React, { useState, useEffect, useFocusEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, LoadingSpinner, ErrorMessage } from '../components/CommonComponents';
import {
  bookingsAPI,
  onBookingStatusUpdated,
  subscribeToBookings,
} from '../services/api';
import { bookingsAPI as bookingAPI } from '../services/api';
import { formatDate, formatTime, getStatusColor, getStatusIcon } from '../utils/validators';

export const MyBookingsScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputEmail, setInputEmail] = useState(email);
  const [searched, setSearched] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (email) {
        fetchBookings();
        subscribeToBookings(email);
      }
    }, [email])
  );

  const fetchBookings = async () => {
    if (!email) {
      setError('Please enter email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getBookingsByEmail(email);

      if (response.data.success) {
        setBookings(response.data.data);
        setSearched(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setEmail(inputEmail);
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await bookingAPI.cancelBooking(bookingId);
              if (response.data.success) {
                Alert.alert('Success', 'Booking cancelled successfully');
                setBookings(bookings.filter((b) => b._id !== bookingId));
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const BookingCard = ({ booking }) => {
    const statusColor = getStatusColor(booking.status);
    const statusIcon = getStatusIcon(booking.status);

    return (
      <Card>
        <View style={styles.bookingHeader}>
          <View>
            <Text style={styles.expertName}>{booking.expertId?.name}</Text>
            <Text style={styles.expertCategory}>{booking.expertId?.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Icon name={statusIcon} size={14} color="#FFF" />
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={14} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(booking.bookingDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="access-time" size={14} color="#666" />
            <Text style={styles.detailText}>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="attach-money" size={14} color="#666" />
            <Text style={styles.detailText}>${booking.amount}</Text>
          </View>
        </View>

        {booking.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}

        {booking.status === 'Pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(booking._id)}
          >
            <Icon name="close" size={16} color="#F44336" />
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  if (!searched) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.searchContainer}>
          <Text style={styles.pageTitle}>My Bookings</Text>

          <View style={styles.emailInputContainer}>
            <Icon name="email" size={20} color="#666" />
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email"
              value={inputEmail}
              onChangeText={setInputEmail}
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Search Bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && bookings.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Bookings</Text>
        <TouchableOpacity
          onPress={() => {
            setSearched(false);
            setInputEmail('');
            setBookings([]);
          }}
        >
          <Icon name="logout" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchBookings}
        />
      )}

      {!error && bookings.length === 0 && (
        <View style={styles.emptyContainer}>
          <Icon name="event-note" size={40} color="#DDD" />
          <Text style={styles.emptyText}>No bookings found</Text>
          <Text style={styles.emptySubtext}>Book an expert to get started</Text>
        </View>
      )}

      {!error && bookings.length > 0 && (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <BookingCard booking={item} />}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchBookings} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginVertical: 16,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    fontSize: 14,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expertName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  expertCategory: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookingDetails: {
    marginVertical: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomColor: '#F0F0F0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  notesSection: {
    marginVertical: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 4,
  },
});
