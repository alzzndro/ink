import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext'; // Adjust path if needed

export default function Home() {
  const { signOut, user } = useAuth();

  const handleSignOut = () => {
    // This will set the user to null
    // The RootLayout's useEffect will then
    // redirect to the '(auth)/login' screen
    signOut();
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Welcome!</Text>
      <Text className="text-lg text-gray-700 mb-8">
        You are logged in as: {user?.email}
      </Text>

      <TouchableOpacity
        className="w-full max-w-sm bg-red-600 p-4 rounded-lg shadow"
        onPress={handleSignOut}
      >
        <Text className="text-white text-center text-lg font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}