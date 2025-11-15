import { Ionicons } from '@expo/vector-icons'; // Assuming you use vector icons
import { Tabs } from 'expo-router';
import { View } from 'react-native'; // <-- 1. ADD THIS IMPORT

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue', // Example color
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
          headerRight: () => (
            <View className="mr-4">{/* Can add buttons here */}</View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}