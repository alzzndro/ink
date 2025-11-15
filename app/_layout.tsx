import { Slot, SplashScreen, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import "../global.css"; // Your global stylesheet

import { AuthProvider, useAuth } from '../context/AuthContext'; // Adjust path if needed

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Main layout component
const RootLayout = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) {
            // We're still loading the auth state, so do nothing
            return;
        }

        // If loading is finished, hide the splash screen
        SplashScreen.hideAsync();

        const inAuthGroup = pathname.startsWith('/(auth)');

        if (user && inAuthGroup) {
            // User is signed in but is on a login/signup screen.
            // Redirect them to the main app (e.g., the home tab).
            router.replace('/(app)/(tabs)'); // <-- FIX: Removed trailing slash
        } else if (!user && !inAuthGroup) {
            // User is not signed in and is NOT on an auth screen.
            // Redirect them to the login screen.
            router.replace('/(auth)/login');
        }
    }, [user, isLoading, pathname]); // Re-run when auth state or location changes

    // Show a loading indicator or null while checking session
    if (isLoading) {
        // You can return a custom loading component here
        return null;
    }

    // Render the currently active route
    return <Slot />;
};

// Wrap the whole app in the AuthProvider
export default function AppLayout() {
    return (
        <AuthProvider>
            <RootLayout />
        </AuthProvider>
    );
}