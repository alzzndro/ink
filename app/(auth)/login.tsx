import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success' | null; text: string }>({
        type: null,
        text: ''
    });

    const router = useRouter();

    const handleSignUp = () => router.replace('/(auth)/signup');

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
            router.replace('/(app)');
        }

        setLoading(false);
    };

    return (
        <View className="flex-1 bg-white justify-center px-8">
            <View className="items-center mb-12">
                <Text className="text-5xl font-extrabold text-gray-900 tracking-tight">Noteaf</Text>
                <Text className="text-gray-500 text-base mt-2">Welcome back! Sign in to continue</Text>
            </View>

            {/* Email Field */}
            <View className="w-full mb-6">
                <Text className="text-base font-medium text-gray-700 mb-2">Email</Text>
                <View className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
                    <TextInput
                        placeholder="you@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="text-gray-900 text-base"
                    />
                </View>
            </View>

            {/* Password Field */}
            <View className="w-full mb-4">
                <Text className="text-base font-medium text-gray-700 mb-2">Password</Text>
                <View className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
                    <TextInput
                        placeholder="Your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password"
                        textContentType="password"
                        className="text-gray-900 text-base"
                    />
                </View>
            </View>

            {/* Error/Success Message */}
            {message.type && (
                <Text
                    className={`text-center mt-2 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'
                        }`}
                >
                    {message.text}
                </Text>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
                className={`w-full mt-8 p-4 rounded-2xl shadow-md flex-row justify-center items-center ${loading ? 'bg-amber-400' : 'bg-amber-600'
                    }`}
                onPress={handleSignIn}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-lg font-semibold">Sign In</Text>
                )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <Pressable onPress={handleSignUp} className="mt-8 items-center">
                <Text className="text-blue-600 font-medium text-base">Don’t have an account? Sign Up</Text>
            </Pressable>
        </View>
    );
}
