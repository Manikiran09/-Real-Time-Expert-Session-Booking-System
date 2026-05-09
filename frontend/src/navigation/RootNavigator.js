import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import { ExpertListingScreen } from '../screens/ExpertListingScreen';
import { ExpertDetailScreen } from '../screens/ExpertDetailScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ExpertStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFF',
          borderBottomWidth: 1,
          borderBottomColor: '#EEE',
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#333',
          fontSize: 18,
        },
        headerTintColor: '#2196F3',
      }}
    >
      <Stack.Screen
        name="ExpertListing"
        component={ExpertListingScreen}
        options={{
          title: 'Find Experts',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ExpertDetail"
        component={ExpertDetailScreen}
        options={({ route }) => ({
          title: route.params?.expertName || 'Expert Details',
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          title: 'Book Session',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

const BookingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFF',
          borderBottomWidth: 1,
          borderBottomColor: '#EEE',
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#333',
          fontSize: 18,
        },
        headerTintColor: '#2196F3',
      }}
    >
      <Stack.Screen
        name="MyBookingsScreen"
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outlined';
            } else if (route.name === 'Bookings') {
              iconName = focused ? 'event-note' : 'event-note';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: '#EEE',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={ExpertStack}
          options={{
            tabBarLabel: 'Experts',
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingsStack}
          options={{
            tabBarLabel: 'My Bookings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
