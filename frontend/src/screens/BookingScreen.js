import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { FormInput, PrimaryButton, Card, LoadingSpinner } from '../components/CommonComponents';
import { validateBookingForm, formatTime, formatDate } from '../utils/validators';
import { bookingsAPI } from '../services/api';

export const BookingScreen = ({ route, navigation }) => {
  const { expert, selectedSlot } = route.params;

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleBooking = async () => {
    // Validate form
    const { isValid, errors: validationErrors } = validateBookingForm({
      ...formData,
      bookingDate: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    });

    if (!isValid) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please fix all errors');
      return;
    }

    try {
      setLoading(true);

      const bookingPayload = {
        expertId: expert._id,
        timeSlotId: selectedSlot._id,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        bookingDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: formData.notes,
      };

      const response = await bookingsAPI.createBooking(bookingPayload);

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Booking created successfully!',
          [
            {
              text: 'View Bookings',
              onPress: () => {
                navigation.navigate('MyBookings', {
                  email: formData.clientEmail,
                });
              },
            },
            {
              text: 'Back to Experts',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Booking failed');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Expert Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expert:</Text>
            <Text style={styles.summaryValue}>{expert.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Category:</Text>
            <Text style={styles.summaryValue}>{expert.category}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {formatDate(selectedSlot.date)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>
              {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.pricingRow]}>
            <Text style={styles.summaryLabel}>Rate:</Text>
            <Text style={styles.pricingValue}>${expert.hourlyRate}/hour</Text>
          </View>
        </Card>

        {/* Booking Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Your Details</Text>

          <FormInput
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.clientName}
            onChangeText={(value) => handleInputChange('clientName', value)}
            error={errors.clientName}
            icon="person"
          />

          <FormInput
            label="Email"
            placeholder="Enter your email"
            value={formData.clientEmail}
            onChangeText={(value) => handleInputChange('clientEmail', value)}
            error={errors.clientEmail}
            keyboardType="email-address"
            icon="email"
          />

          <FormInput
            label="Phone"
            placeholder="Enter your phone number"
            value={formData.clientPhone}
            onChangeText={(value) => handleInputChange('clientPhone', value)}
            error={errors.clientPhone}
            keyboardType="phone-pad"
            icon="phone"
          />

          <FormInput
            label="Notes (Optional)"
            placeholder="Add any notes or questions..."
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            multiline={true}
            numberOfLines={4}
            icon="note"
          />
        </View>

        {/* Booking Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={`Confirm Booking - $${expert.hourlyRate}`}
            onPress={handleBooking}
            loading={loading}
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
  summaryCard: {
    marginHorizontal: 12,
    marginVertical: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  pricingRow: {
    borderBottomWidth: 0,
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: '#2196F3',
  },
  pricingValue: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '700',
  },
  formContainer: {
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  formTitle: {
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
});
