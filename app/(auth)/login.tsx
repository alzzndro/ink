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
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InkInput from '../../components/InkInput'; // Adjust path if needed
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
            setMessage({ type: 'error', text: 'Please enter both email and password.' });
            return;
        }

        setLoading(true);
        setMessage({ type: null, text: '' });

        const { error } = await signIn(email, password);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Welcome back.' });
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
                <SafeAreaView className="flex-1 justify-center px-8">

                    {/* --- HEADER --- */}
                    <View className="items-center mb-16">
                        <View className="w-16 h-16 bg-black rounded-full items-center justify-center shadow-2xl shadow-black/30 mb-6">
                            <Ionicons name="water" size={28} color="white" style={{ marginLeft: 2 }} />
                        </View>

                        <Text className="text-6xl font-light text-black tracking-tighter mb-2">
                            Ink.
                        </Text>
                        <Text className="text-zinc-400 text-base font-medium tracking-wide">
                            Focus on the words.
                        </Text>
                    </View>

                    {/* --- FORM (Using InkInput) --- */}
                    <View className="space-y-6">

                        <InkInput
                            icon="mail-outline"
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View>
                            <InkInput
                                icon="lock-closed-outline"
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                isPassword={true} // Handles toggle logic internally
                            />
                            {/* Forgot Password Link */}
                            <TouchableOpacity className="items-end mt-4">
                                <Text className="text-zinc-500 font-semibold text-sm tracking-wide">
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    {/* --- FEEDBACK --- */}
                    {message.type && (
                        <View className={`mt-6 p-4 rounded-2xl flex-row items-center justify-center bg-zinc-50 border ${message.type === 'error' ? 'border-red-100' : 'border-green-100'
                            }`}>
                            <Ionicons
                                name={message.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
                                size={20}
                                color={message.type === 'error' ? '#ef4444' : '#10b981'}
                            />
                            <Text className={`ml-3 font-medium ${message.type === 'error' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {message.text}
                            </Text>
                        </View>
                    )}

                    {/* --- ACTION --- */}
                    <View className="mt-10 space-y-8 flex flex-col gap-5">
                        <TouchableOpacity
                            className={`w-full py-5 rounded-full flex-row justify-center items-center shadow-xl shadow-black/20 ${loading ? 'bg-zinc-800' : 'bg-black'
                                }`}
                            onPress={handleSignIn}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white text-lg font-bold tracking-wider mr-2">
                                        SIGN IN
                                    </Text>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center">
                            <Text className="text-zinc-400 text-base">New to Ink? </Text>
                            <Pressable onPress={handleSignUp}>
                                <Text className="text-black font-bold text-base underline decoration-1 underline-offset-4 ml-1">
                                    Create Account
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                </SafeAreaView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}