import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import InkInput from '../../components/InkInput'; // Adjust path if needed
import { useAuth } from "../../context/AuthContext";

export default function SignUp() {
    const { signUp } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | null; text: string }>({
        type: null,
        text: "",
    });

    const handleRegister = async () => {
        setMessage({ type: null, text: "" });

        if (!fullName || !email || !password || !confirm) {
            return setMessage({ type: "error", text: "Please fill in all fields." });
        }

        if (password !== confirm) {
            return setMessage({ type: "error", text: "Passwords do not match." });
        }

        setLoading(true);
        const { error } = await signUp(email, password, fullName);

        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setMessage({
                type: "success",
                text: "Account created. Please verify your email.",
            });

            setTimeout(() => router.replace("/(auth)/login"), 1500);
        }

        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView className="flex-1 justify-center px-8">

                    {/* --- HEADER --- */}
                    <View className="items-center mb-10">
                        {/* Outline User Icon */}
                        <View className="w-16 h-16 bg-white border border-zinc-200 rounded-full items-center justify-center shadow-sm mb-6">
                            <Ionicons name="person-add-outline" size={28} color="black" />
                        </View>

                        <Text className="text-5xl font-light text-black tracking-tighter mb-2">
                            Join Ink.
                        </Text>
                        <Text className="text-zinc-400 text-base font-medium tracking-wide text-center leading-6">
                            Start your minimalist journey.
                        </Text>
                    </View>

                    {/* --- FORM FIELDS --- */}
                    <View className="space-y-5">

                        {/* Full Name */}
                        <InkInput
                            icon="person-outline"
                            placeholder="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />

                        {/* Email */}
                        <InkInput
                            icon="mail-outline"
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Password Group */}
                        <View className="flex-row space-x-3">
                            <View className="flex-1">
                                <InkInput
                                    icon="lock-closed-outline"
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    isPassword={true}
                                />
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <InkInput
                            icon="shield-checkmark-outline"
                            placeholder="Confirm Password"
                            value={confirm}
                            onChangeText={setConfirm}
                            isPassword={true}
                        />

                    </View>

                    {/* --- FEEDBACK MESSAGE --- */}
                    {message.type && (
                        <View className={`mt-6 p-4 rounded-2xl flex-row items-center justify-center bg-zinc-50 border ${message.type === "error" ? "border-red-100" : "border-green-100"
                            }`}>
                            <Ionicons
                                name={message.type === "error" ? "alert-circle" : "checkmark-circle"}
                                size={20}
                                color={message.type === "error" ? "#ef4444" : "#10b981"}
                            />
                            <Text
                                className={`ml-3 font-medium ${message.type === "error" ? "text-red-600" : "text-green-600"
                                    }`}
                            >
                                {message.text}
                            </Text>
                        </View>
                    )}

                    {/* --- ACTIONS --- */}
                    <View className="mt-8 space-y-6 flex flex-col gap-5">
                        <TouchableOpacity
                            className={`w-full py-5 rounded-full flex-row justify-center items-center shadow-xl shadow-black/20 ${loading ? "bg-zinc-800" : "bg-black"
                                }`}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white text-lg font-bold tracking-wider mr-2">
                                        CREATE ACCOUNT
                                    </Text>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center">
                            <Text className="text-zinc-400 text-base">Already have an account?</Text>
                            <Pressable onPress={() => router.replace("/(auth)/login")}>
                                <Text className="text-black font-bold text-base underline decoration-1 underline-offset-4 ml-1">
                                    Sign In
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                </SafeAreaView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}