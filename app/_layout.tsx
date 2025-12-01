import { Slot, SplashScreen, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootLayout() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        if (isLoading) return;

        // If nav state is not ready, we can't redirect yet
        if (!navigationState?.key) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (user && inAuthGroup) {
            router.replace("/(app)");
        } else if (!user && !inAuthGroup) {
            router.replace("/(auth)/login");
        } else {
            // Only hide splash screen once we know where we are going
            SplashScreen.hideAsync();
        }
    }, [user, isLoading, segments, navigationState?.key]);

    // 1. IMPORTANT: Wait for navigation state to be ready
    if (!navigationState?.key || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // 2. Only render the app once we are ready
    return <Slot />;
}

export default function AppLayout() {
    return (
        <AuthProvider>
            <RootLayout />
        </AuthProvider>
    );
}