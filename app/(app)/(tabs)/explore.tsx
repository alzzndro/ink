import React from 'react';
import { Text, View } from 'react-native';

export default function Explore() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl">Explore Screen</Text>
      <Text className="text-base text-gray-600 mt-2">
        You can only see this if you are logged in.
      </Text>
    </View>
  );
}