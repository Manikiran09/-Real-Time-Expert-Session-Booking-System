import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../components/CommonComponents';
import { formatTime, formatDate } from '../utils/validators';

export const TimeSlotCard = ({ slot, available, onSelect, selected = false }) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={!available}
      activeOpacity={available ? 0.7 : 1}
    >
      <Card
        style={[
          styles.slotCard,
          !available && styles.slotCardDisabled,
          selected && styles.slotCardSelected,
        ]}
      >
        <View style={styles.slotContent}>
          <View>
            <Text style={styles.slotTime}>
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </Text>
            <Text style={styles.slotDate}>{formatDate(slot.date)}</Text>
          </View>
          <View
            style={[
              styles.slotStatus,
              available ? styles.slotAvailable : styles.slotBooked,
              selected && styles.slotSelected,
            ]}
          >
            <Icon
              name={available ? 'check-circle' : 'block'}
              size={20}
              color={available ? '#4CAF50' : '#F44336'}
            />
          </View>
        </View>
        {!available && <Text style={styles.bookedText}>Already Booked</Text>}
      </Card>
    </TouchableOpacity>
  );
};

export const TimeSlotsByDate = ({ slots, selectedSlot, onSelectSlot }) => {
  if (!slots || Object.keys(slots).length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="calendar-today" size={40} color="#DDD" />
        <Text style={styles.emptyText}>No available slots</Text>
      </View>
    );
  }

  return (
    <View>
      {Object.entries(slots).map(([date, dateSlots]) => (
        <View key={date} style={styles.dateSection}>
          <Text style={styles.dateHeader}>{formatDate(date + 'T00:00:00')}</Text>
          <View style={styles.slotsGrid}>
            {dateSlots.map((slot) => (
              <View key={slot._id} style={styles.slotWrapper}>
                <TimeSlotCard
                  slot={slot}
                  available={!slot.isBooked}
                  selected={selectedSlot?._id === slot._id}
                  onSelect={() => onSelectSlot(slot)}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  slotCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  slotCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  slotCardSelected: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  slotContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  slotDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  slotStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotAvailable: {
    backgroundColor: '#E8F5E9',
  },
  slotBooked: {
    backgroundColor: '#FFEBEE',
  },
  slotSelected: {
    backgroundColor: '#BBDEFB',
  },
  bookedText: {
    fontSize: 11,
    color: '#F44336',
    marginTop: 4,
  },
  dateSection: {
    marginVertical: 12,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotWrapper: {
    width: '48%',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
