import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-center px-8">

                    {/* Header Section */}
                    <View className="mb-12 flex flex-col items-center">
                        <View className="w-14 h-14 bg-emerald-100 rounded-2xl items-center justify-center shadow-sm mb-4">
                            <Ionicons name="leaf" size={28} color="#059669" />
                        </View>

                        <Text className="text-4xl font-extrabold text-emerald-900 tracking-tight">
                            Notees
                        </Text>

                        <Text className="text-emerald-600 mt-2 text-base font-medium">
                            Login to continue
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-6">

                        {/* Email */}
                        <View>
                            <Text className="text-xs font-bold text-emerald-700 uppercase ml-1 mb-2 tracking-wider">
                                Email Address
                            </Text>

                            <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-4">
                                <Ionicons name="mail-outline" size={20} color="#047857" />
                                <TextInput
                                    placeholder="name@example.com"
                                    placeholderTextColor="#6ee7b7"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="flex-1 ml-3 text-emerald-900 text-base"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View>
                            <Text className="text-xs font-bold text-emerald-700 uppercase ml-1 mb-2 tracking-wider">
                                Password
                            </Text>

                            <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-4">
                                <Ionicons name="lock-closed-outline" size={20} color="#047857" />
                                <TextInput
                                    placeholder="Enter your password"
                                    placeholderTextColor="#6ee7b7"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                    className="flex-1 ml-3 text-emerald-900 text-base"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#047857"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity className="items-end mt-2">
                                <Text className="text-emerald-700 text-sm font-semibold">
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    {/* Status Message */}
                    {message.type && (
                        <View
                            className={`mt-6 p-3 rounded-xl flex-row items-center justify-center 
                                ${message.type === 'error'
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-emerald-50 border border-emerald-200'
                                }
                            `}
                        >
                            <Ionicons
                                name={message.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
                                size={20}
                                color={message.type === 'error' ? '#dc2626' : '#047857'}
                            />
                            <Text
                                className={`ml-2 font-medium 
                                    ${message.type === 'error'
                                        ? 'text-red-700'
                                        : 'text-emerald-700'
                                    }
                                `}
                            >
                                {message.text}
                            </Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View className="mt-10">
                        <TouchableOpacity
                            className={`w-full py-4 rounded-2xl shadow-xl flex-row justify-center items-center 
                                ${loading
                                    ? 'bg-emerald-400'
                                    : 'bg-emerald-600 shadow-emerald-400/40'
                                }
                            `}
                            onPress={handleSignIn}
                            disabled={loading}
                        >
                            {loading && <ActivityIndicator color="white" className="mr-2" />}
                            <Text className="text-white text-lg font-bold">
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center mt-6">
                            <Text className="text-emerald-600 font-medium">
                                Don’t have an account?
                            </Text>
                            <Pressable onPress={handleSignUp}>
                                <Text className="text-emerald-800 font-bold text-base ml-1">
                                    Sign Up
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
