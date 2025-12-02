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
            className="flex-1 bg-slate-50"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-center px-8">

                    {/* Header Section */}
                    <View className="mb-10">
                        <View className="w-14 h-14 bg-white rounded-xl items-center justify-center border border-slate-200 shadow-sm mb-5">
                            <Ionicons name="person-add-outline" size={28} color="#0f172a" />
                        </View>

                        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                            New User
                        </Text>
                        <Text className="text-4xl font-black text-slate-900 tracking-tighter">
                            Join Workspace
                        </Text>
                        <Text className="text-slate-500 mt-2 text-base leading-6">
                            Create your digital ID to start capturing notes.
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View className="space-y-4">

                        {/* Full Name */}
                        <View>
                            <Text className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">
                                Identity
                            </Text>
                            <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-4 py-4 focus:border-slate-900">
                                <Ionicons name="id-card-outline" size={20} color="#64748b" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-900 text-base font-medium"
                                    placeholder="Full Name"
                                    placeholderTextColor="#94a3b8"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View>
                            <Text className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">
                                Contact
                            </Text>
                            <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-4 py-4 focus:border-slate-900">
                                <Ionicons name="mail-outline" size={20} color="#64748b" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-900 text-base font-medium"
                                    placeholder="work@email.com"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Password Group */}
                        <View className="flex-row space-x-3">
                            {/* Password */}
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">
                                    Password
                                </Text>
                                <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-4 py-4 focus:border-slate-900">
                                    <TextInput
                                        className="flex-1 text-slate-900 text-base font-medium"
                                        placeholder="••••••"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                </View>
                            </View>

                            {/* Confirm */}
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">
                                    Confirm
                                </Text>
                                <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-4 py-4 focus:border-slate-900">
                                    <TextInput
                                        className="flex-1 text-slate-900 text-base font-medium"
                                        placeholder="••••••"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry={!showConfirm}
                                        value={confirm}
                                        onChangeText={setConfirm}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Message */}
                    {message.type && (
                        <View className={`mt-6 p-4 rounded-lg flex-row items-start ${message.type === "error"
                            ? "bg-red-50 border border-red-100"
                            : "bg-green-50 border border-green-100"
                            }`}>
                            <Ionicons
                                name={message.type === "error" ? "warning" : "checkmark-circle"}
                                size={20}
                                color={message.type === "error" ? "#ef4444" : "#10b981"}
                            />
                            <Text
                                className={`ml-3 font-medium flex-1 ${message.type === "error"
                                    ? "text-red-700"
                                    : "text-green-700"
                                    }`}
                            >
                                {message.text}
                            </Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View className="mt-8">
                        <TouchableOpacity
                            className={`w-full py-4 rounded-xl shadow-lg flex-row justify-center items-center ${loading
                                ? "bg-slate-700"
                                : "bg-slate-900 shadow-slate-900/20"
                                }`}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading && <ActivityIndicator color="white" className="mr-2" />}
                            <Text className="text-white text-lg font-bold tracking-wide">
                                {loading ? "Initializing..." : "Create Workspace ID"}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center mt-8">
                            <Text className="text-slate-500 font-medium">Already have an ID?</Text>
                            <Pressable onPress={() => router.replace("/(auth)/login")} className="ml-2 border-b-2 border-slate-900 pb-0.5">
                                <Text className="text-slate-900 font-bold text-base">
                                    Access Login
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}