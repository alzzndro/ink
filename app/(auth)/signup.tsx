import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase'; // Adjust path if needed

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success' | null; text: string }>({
        type: null,
        text: '',
    });

    const router = useRouter();

    const handleSignUp = async () => {
        if (!email || !password) {
            setMessage({ type: 'error', text: 'Email and password are required.' });
            return;
        }

        setLoading(true);
        setMessage({ type: null, text: '' });

        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({
                type: 'success',
                text: 'Sign up successful! Please check your email to confirm.',
            });
            router.replace('/(auth)/login');
        }

        setLoading(false);
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-4">
            <Text className="text-3xl font-bold mb-8 text-gray-800">Create Account</Text>

            <View className="w-full max-w-sm">
                <Text className="text-sm font-medium text-gray-600 mb-2">Email</Text>
                <TextInput
                    className="w-full p-4 border border-gray-300 rounded-lg bg-white text-base"
                    placeholder="your@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="w-full max-w-sm mt-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">Password</Text>
                <TextInput
                    className="w-full p-4 border border-gray-300 rounded-lg bg-white text-base"
                    placeholder="Your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            {message.type && (
                <Text
                    className={`mt-4 text-center ${message.type === 'error' ? 'text-red-600' : 'text-green-600'
                        }`}
                >
                    {message.text}
                </Text>
            )}

            <TouchableOpacity
                className={`w-full max-w-sm p-4 rounded-lg mt-8 shadow ${loading ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                onPress={handleSignUp}
                disabled={loading}
            >
                <Text className="text-white text-center text-lg font-semibold">
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
            </TouchableOpacity>

            <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-8">
                <Text className="text-blue-600 text-base font-medium">
                    Already have an account? Sign In
                </Text>
            </Pressable>
        </View>
    );
}
