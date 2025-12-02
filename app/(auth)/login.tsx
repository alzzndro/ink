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
            className="flex-1 bg-slate-50"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-center px-8">

                    {/* Header Section */}
                    <View className="mb-10">
                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 bg-white rounded-xl items-center justify-center border border-slate-200 shadow-sm mr-4">
                                <Ionicons name="reader" size={24} color="#0f172a" />
                            </View>
                            <View>
                                <Text className="text-4xl font-black text-slate-900 tracking-tighter">
                                    Note--
                                </Text>
                            </View>
                        </View>

                        <Text className="text-slate-500 text-lg leading-6">
                            Authentication required to access your dashboard.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-5">

                        {/* Email */}
                        <View>
                            <Text className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">
                                Email
                            </Text>
                            <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-4 py-4 focus:border-slate-900">
                                <Ionicons name="at-outline" size={20} color="#64748b" />
                                <TextInput
                                    placeholder="user@domain.com"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="flex-1 ml-3 text-slate-900 text-base font-medium"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View>
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Password
                                </Text>
                                <TouchableOpacity>
                                    <Text className="text-xs font-bold text-indigo-600">
                                        Forgot?
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-4 py-4 focus:border-slate-900">
                                <Ionicons name="key-outline" size={20} color="#64748b" />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                    className="flex-1 ml-3 text-slate-900 text-base font-medium"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>

                    {/* Status Message */}
                    {message.type && (
                        <View className={`mt-6 p-4 rounded-lg flex-row items-start ${message.type === 'error'
                            ? 'bg-red-50 border border-red-100'
                            : 'bg-green-50 border border-green-100'
                            }`}>
                            <Ionicons
                                name={message.type === 'error' ? 'warning' : 'checkmark-circle'}
                                size={20}
                                color={message.type === 'error' ? '#ef4444' : '#10b981'}
                            />
                            <Text className={`ml-3 font-medium flex-1 ${message.type === 'error' ? 'text-red-700' : 'text-green-700'
                                }`}>
                                {message.text}
                            </Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View className="mt-8">
                        <TouchableOpacity
                            className={`w-full py-4 rounded-xl shadow-lg flex-row justify-center items-center ${loading ? 'bg-slate-700' : 'bg-slate-900 shadow-slate-900/20'
                                }`}
                            onPress={handleSignIn}
                            disabled={loading}
                        >
                            {loading && <ActivityIndicator color="white" className="mr-2" />}
                            <Text className="text-white text-lg font-bold tracking-wide">
                                {loading ? 'Processing...' : 'Enter Workspace'}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center mt-8">
                            <Text className="text-slate-500 font-medium">
                                New to Note-- ?
                            </Text>
                            <Pressable onPress={handleSignUp} className="ml-2 border-b-2 border-slate-900 pb-0.5">
                                <Text className="text-slate-900 font-bold text-base">
                                    Create Account
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}