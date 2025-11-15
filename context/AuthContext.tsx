import { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path as needed

// Define the shape of your context data
interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (
        email: string, // <-- FIX: Added type
        password: string // <-- FIX: Added type
    ) => Promise<AuthResponse>;
    signOut: () => Promise<{ error: AuthError | null }>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for an initial session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Callback to run when auth state changes (signIn, signOut)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
            }
        );

        // Cleanup listener on unmount
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const authValue: AuthContextType = {
        user,
        session,
        isLoading,
        signIn: (email, password) => {
            // Supabase signIn returns a promise
            return supabase.auth.signInWithPassword({ email, password });
        },
        signOut: () => {
            // Supabase signOut returns a promise
            return supabase.auth.signOut();
        },
    };

    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};