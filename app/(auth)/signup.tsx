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

export default function SignUp() {
    const { signUp } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    // UI Only states (does not break logic)
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-center px-8">

                    {/* Header Section */}
                    <View className="mb-8">
                        <View className="w-16 h-16 bg-amber-100 rounded-2xl items-center justify-center mb-4 border border-amber-200">
                            <Ionicons name="person-add-outline" size={32} color="#d97706" />
                        </View>
                        <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            Create Account
                        </Text>
                        <Text className="text-gray-500 mt-2 text-base">
                            Join us and start capturing your thoughts.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-4">

                        {/* Full Name */}
                        <View>
                            <Text className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 tracking-wide">Full Name</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
                                <Ionicons name="person-outline" size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                    placeholder="Juan Dela Cruz"
                                    placeholderTextColor="#9ca3af"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View>
                            <Text className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 tracking-wide">Email Address</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
                                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                    placeholder="your@email.com"
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View>
                            <Text className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 tracking-wide">Password</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
                                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                    placeholder="Create a password"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#9ca3af"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View>
                            <Text className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 tracking-wide">Confirm Password</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
                                <Ionicons name="shield-checkmark-outline" size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                    placeholder="Confirm password"
                                    placeholderTextColor="#9ca3af"
                                    value={confirm}
                                    onChangeText={setConfirm}
                                    secureTextEntry={!showConfirm}
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                    <Ionicons
                                        name={showConfirm ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#9ca3af"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>

                    {/* Status Message */}
                    {message.type && (
                        <View className={`mt-6 p-3 rounded-xl flex-row items-center justify-center ${message.type === 'error' ? 'bg-red-50' : 'bg-green-50'
                            }`}>
                            <Ionicons
                                name={message.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
                                size={20}
                                color={message.type === 'error' ? '#ef4444' : '#16a34a'}
                            />
                            <Text className={`ml-2 font-medium ${message.type === 'error' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {message.text}
                            </Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View className="mt-8 space-y-4">
                        <TouchableOpacity
                            className={`w-full py-4 rounded-2xl shadow-lg flex-row justify-center items-center ${loading ? 'bg-amber-400' : 'bg-amber-500 shadow-amber-500/30'
                                }`}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading && <ActivityIndicator color="white" className="mr-2" />}
                            <Text className="text-white text-center text-lg font-bold">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center mt-2">
                            <Text className="text-gray-500">Already have an account? </Text>
                            <Pressable onPress={() => router.replace('/(auth)/login')}>
                                <Text className="text-amber-600 font-bold text-base">Sign In</Text>
                            </Pressable>
                        </View>
                    </View>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}