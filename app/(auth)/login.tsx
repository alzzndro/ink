import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success' | null; text: string }>({
        type: null,
        text: '',
    });

    const router = useRouter();

    const handleSignIn = async () => {
        if (!email || !password) {
            setMessage({ type: 'error', text: 'Email and password are required.' });
            return;
        }

        setLoading(true);
        setMessage({ type: null, text: '' });

        const { error } = await signIn(email, password);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Welcome back!' });
            // Navigate after successful sign-in (optional)
            // router.replace('/(tabs)/home');
        }

        setLoading(false);
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-4">
            <Text className="text-3xl font-bold mb-8 text-gray-800">Welcome Back</Text>

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
                onPress={handleSignIn}
                disabled={loading}
            >
                <Text className="text-white text-center text-lg font-semibold">
                    {loading ? 'Signing In...' : 'Sign In'}
                </Text>
            </TouchableOpacity>

            <Pressable onPress={() => router.replace('/signup')} className="mt-8">
                <Text className="text-blue-600 text-base font-medium">
                    Don’t have an account? Sign Up
                </Text>
            </Pressable>
        </View>
    );
}
