import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignUp() {
    const { signUp } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
        type: null,
        text: '',
    });

    const handleRegister = async () => {
        setMessage({ type: null, text: '' });

        if (!fullName || !email || !password || !confirm) {
            return setMessage({ type: 'error', text: 'All fields are required.' });
        }

        if (password !== confirm) {
            return setMessage({ type: 'error', text: 'Passwords do not match.' });
        }

        setLoading(true);
        const { error } = await signUp(email, password, fullName);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({
                type: 'success',
                text: 'Account created. Please check your email to verify.',
            });
            setTimeout(() => router.replace('/(auth)/login'), 1500);
        }

        setLoading(false);
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-4">
            <Text className="text-4xl font-bold mb-8 text-gray-900">
                Create Account
            </Text>

            <View className="w-full max-w-sm">
                <Text className="text-gray-600 mb-1 text-sm">Full Name</Text>
                <TextInput
                    className="w-full p-4 border rounded-lg bg-white"
                    placeholder="Juan Dela Cruz"
                    value={fullName}
                    onChangeText={setFullName}
                />
            </View>

            <View className="w-full max-w-sm mt-3">
                <Text className="text-gray-600 mb-1 text-sm">Email</Text>
                <TextInput
                    className="w-full p-4 border rounded-lg bg-white"
                    placeholder="your@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View className="w-full max-w-sm mt-3">
                <Text className="text-gray-600 mb-1 text-sm">Password</Text>
                <TextInput
                    className="w-full p-4 border rounded-lg bg-white"
                    placeholder="Enter password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <View className="w-full max-w-sm mt-3">
                <Text className="text-gray-600 mb-1 text-sm">Confirm Password</Text>
                <TextInput
                    className="w-full p-4 border rounded-lg bg-white"
                    placeholder="Confirm password"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                />
            </View>

            {message.type && (
                <Text className={`mt-3 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {message.text}
                </Text>
            )}

            <TouchableOpacity
                className={`w-full max-w-sm p-4 mt-6 rounded-lg ${loading ? 'bg-blue-400' : 'bg-blue-700'}`}
                disabled={loading}
                onPress={handleRegister}
            >
                <Text className="text-white text-center font-bold">
                    {loading ? 'Creating...' : 'Create Account'}
                </Text>
            </TouchableOpacity>

            <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-5">
                <Text className="text-blue-600 font-medium">
                    Already have an account? Sign In
                </Text>
            </Pressable>
        </View>
    );
}
