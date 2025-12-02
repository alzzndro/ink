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
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function SignUp() {
    const { signUp } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | null; text: string }>({
        type: null,
        text: "",
    });

    const handleRegister = async () => {
        setMessage({ type: null, text: "" });

        if (!fullName || !email || !password || !confirm) {
            return setMessage({ type: "error", text: "All fields are required." });
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
                <View className="flex-1 justify-center px-8">

                    {/* Icon + Header */}
                    <View className="mb-12 items-start flex flex-col items-center">
                        <View className="w-20 h-20 bg-emerald-100 rounded-3xl items-center justify-center shadow-md border border-emerald-200">
                            <Ionicons name="person-add-outline" size={36} color="#047857" />
                        </View>

                        <Text className="text-4xl mt-4 font-extrabold text-emerald-900 tracking-tight">
                            Create Account
                        </Text>

                        <Text className="text-emerald-600 mt-1 text-base">
                            Start capturing your ideas instantly.
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View className="space-y-6">

                        {/* Full Name */}
                        <View>
                            <Text className="text-xs font-bold text-emerald-700 uppercase ml-1 mb-2 tracking-wider">
                                Full Name
                            </Text>

                            <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-3xl px-5 py-4 shadow-sm">
                                <Ionicons name="person-outline" size={20} color="#047857" />
                                <TextInput
                                    className="flex-1 ml-3 text-emerald-900 text-base"
                                    placeholder="Juan Dela Cruz"
                                    placeholderTextColor="#6ee7b7"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View>
                            <Text className="text-xs font-bold text-emerald-700 uppercase ml-1 mb-2 tracking-wider">
                                Email Address
                            </Text>

                            <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-3xl px-5 py-4 shadow-sm">
                                <Ionicons name="mail-outline" size={20} color="#047857" />
                                <TextInput
                                    className="flex-1 ml-3 text-emerald-900 text-base"
                                    placeholder="you@example.com"
                                    placeholderTextColor="#6ee7b7"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View>
                            <Text className="text-xs font-bold text-emerald-700 uppercase ml-1 mb-2 tracking-wider">
                                Password
                            </Text>

                            <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-3xl px-5 py-4 shadow-sm">
                                <Ionicons name="lock-closed-outline" size={20} color="#047857" />
                                <TextInput
                                    className="flex-1 ml-3 text-emerald-900 text-base"
                                    placeholder="Create a password"
                                    placeholderTextColor="#6ee7b7"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#047857"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View>
                            <Text className="text-xs font-bold text-emerald-700 uppercase ml-1 mb-2 tracking-wider">
                                Confirm Password
                            </Text>

                            <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-3xl px-5 py-4 shadow-sm">
                                <Ionicons name="shield-checkmark-outline" size={20} color="#047857" />
                                <TextInput
                                    className="flex-1 ml-3 text-emerald-900 text-base"
                                    placeholder="Confirm password"
                                    placeholderTextColor="#6ee7b7"
                                    secureTextEntry={!showConfirm}
                                    value={confirm}
                                    onChangeText={setConfirm}
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                    <Ionicons
                                        name={showConfirm ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#047857"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Message */}
                    {message.type && (
                        <View
                            className={`mt-6 p-3 rounded-xl flex-row items-center justify-center ${message.type === "error"
                                ? "bg-red-50 border border-red-200"
                                : "bg-emerald-50 border border-emerald-200"
                                }`}
                        >
                            <Ionicons
                                name={message.type === "error" ? "alert-circle" : "checkmark-circle"}
                                size={20}
                                color={message.type === "error" ? "#dc2626" : "#047857"}
                            />
                            <Text
                                className={`ml-2 font-medium ${message.type === "error"
                                    ? "text-red-700"
                                    : "text-emerald-700"
                                    }`}
                            >
                                {message.text}
                            </Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View className="mt-10 space-y-4">
                        <TouchableOpacity
                            className={`w-full py-4 rounded-3xl shadow-lg flex-row justify-center items-center ${loading
                                ? "bg-emerald-400"
                                : "bg-emerald-600 shadow-emerald-400/40"
                                }`}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading && <ActivityIndicator color="white" className="mr-2" />}
                            <Text className="text-white text-center text-lg font-bold">
                                {loading ? "Creating Account..." : "Create Account"}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center">
                            <Text className="text-emerald-600">Already have an account?</Text>
                            <Pressable onPress={() => router.replace("/(auth)/login")}>
                                <Text className="text-emerald-800 font-bold text-base ml-1">
                                    Sign In
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
