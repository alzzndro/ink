import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';

export default function Modal() {
    const router = useRouter();

    return (
        <View className="flex-1 items-center justify-center bg-white p-4">
            <Text className="text-2xl font-bold">This is a Modal</Text>

            <Text className="text-base text-gray-600 my-4">
                Modals are presented on top of the current screen.
            </Text>

            {/* Use a light status bar on a light background */}
            <StatusBar style="light" />

            <Pressable onPress={() => router.back()} className="mt-8 bg-blue-600 rounded-lg p-4">
                <Text className="text-white text-lg font-semibold">Close Modal</Text>
            </Pressable>
        </View>
    );
}