import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  LoadingSpinner,
  ErrorMessage,
  Card,
  PrimaryButton,
} from '../components/CommonComponents';
import { TimeSlotsByDate } from '../components/TimeSlotCard';
import { expertsAPI } from '../services/api';
import { subscribeToExpert, onSlotBooked, unsubscribeFromExpert } from '../services/socket';

export const ExpertDetailScreen = ({ route, navigation }) => {
  const { expertId } = route.params;
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState({});

  useEffect(() => {
    fetchExpertDetails();
    subscribeToExpert(expertId);

    const slotBookedHandler = (data) => {
      if (data.expertId === expertId) {
        // Refresh slots if same expert
        fetchExpertDetails();
      }
    };

    onSlotBooked(slotBookedHandler);

    return () => {
      unsubscribeFromExpert(expertId);
    };
  }, [expertId]);

  const fetchExpertDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expertsAPI.getExpertById(expertId);

      if (response.data.success) {
        setExpert(response.data.data);
        setSlots(response.data.data.availableSlots || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch expert details');
      console.error('Error fetching expert details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    navigation.navigate('Booking', {
      expert,
      selectedSlot,
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchExpertDetails} />;
  }

  if (!expert) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Expert not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Expert Header */}
        <Card>
          <View style={styles.headerSection}>
            <View>
              <Text style={styles.expertName}>{expert.name}</Text>
              <Text style={styles.expertCategory}>{expert.category}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={18} color="#FFB800" />
              <Text style={styles.rating}>{expert.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({expert.totalReviews})</Text>
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.bio}>{expert.bio || `Expert in ${expert.category}`}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={16} color="#2196F3" />
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={styles.statValue}>{expert.experience} years</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="attach-money" size={16} color="#4CAF50" />
              <Text style={styles.statLabel}>Rate</Text>
              <Text style={styles.statValue}>${expert.hourlyRate}/hour</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="people" size={16} color="#FF9800" />
              <Text style={styles.statLabel}>Bookings</Text>
              <Text style={styles.statValue}>{expert.totalBookings}</Text>
            </View>
          </View>
        </Card>

        {/* Available Slots */}
        <View style={styles.slotsSection}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <TimeSlotsByDate
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </View>

        {/* Book Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={selectedSlot ? 'Continue to Booking' : 'Select a Slot First'}
            onPress={handleBookSlot}
            disabled={!selectedSlot}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expertName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  expertCategory: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
    color: '#333',
  },
  reviews: {
    fontSize: 11,
    color: '#766',
    marginLeft: 2,
  },
  bioSection: {
    marginVertical: 12,
  },
  bio: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  slotsSection: {
    paddingHorizontal: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  buttonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
