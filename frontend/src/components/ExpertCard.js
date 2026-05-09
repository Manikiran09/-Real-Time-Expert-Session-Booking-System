import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, LoadingSpinner, ErrorMessage } from '../components/CommonComponents';
import { expertsAPI } from '../services/api';
import { formatDate } from '../utils/validators';

export const ExpertCard = ({ expert, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card>
        <View style={styles.expertHeader}>
          <View>
            <Text style={styles.expertName}>{expert.name}</Text>
            <Text style={styles.expertCategory}>{expert.category}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFB800" />
            <Text style={styles.rating}>{expert.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.bio} numberOfLines={2}>
          {expert.bio || 'Expert in ' + expert.category}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="trending-up" size={14} color="#666" />
            <Text style={styles.infoText}>{expert.experience} yrs</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="attach-money" size={14} color="#666" />
            <Text style={styles.infoText}>${expert.hourlyRate}/hr</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="people" size={14} color="#666" />
            <Text style={styles.infoText}>{expert.totalBookings} bookings</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  expertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  expertCategory: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#333',
  },
  bio: {
    fontSize: 13,
    color: '#666',
    marginVertical: 8,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
});
