import { Stack } from 'expo-router';

export default function AuthLayout() {
    // This layout is for the auth screens
    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            {/* You could add a "signup" screen here if you had one */}
            <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
        </Stack>
    );
}