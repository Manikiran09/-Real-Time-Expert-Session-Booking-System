import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ExpertCard } from '../components/ExpertCard';
import { LoadingSpinner, ErrorMessage } from '../components/CommonComponents';
import { expertsAPI } from '../services/api';
import config from '../config/api';

export const ExpertListingScreen = ({ navigation }) => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExperts();
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    if (selectedCategory || searchQuery) {
      fetchExperts(1);
    }
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await expertsAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchExperts = async (pageNum = page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await expertsAPI.getAllExperts(
        pageNum,
        config.PAGINATION_LIMIT,
        selectedCategory,
        searchQuery
      );

      if (response.data.success) {
        if (pageNum === 1) {
          setExperts(response.data.data);
        } else {
          setExperts((prev) => [...prev, ...response.data.data]);
        }
        setTotalPages(response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch experts');
      console.error('Error fetching experts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      fetchExperts(page + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchExperts(1);
  };

  if (loading && experts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Experts</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Icon name="tune" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedCategory && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory('')}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedCategory && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Experts List */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {!error && experts.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Icon name="person-off" size={40} color="#DDD" />
          <Text style={styles.emptyText}>No experts found</Text>
        </View>
      )}

      {!error && experts.length > 0 && (
        <FlatList
          data={experts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ExpertCard
              expert={item}
              onPress={() =>
                navigation.navigate('ExpertDetail', { expertId: item._id })
              }
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 14,
    color: '#333',
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
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
});
