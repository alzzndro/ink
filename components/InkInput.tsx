import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InkInputProps extends TextInputProps {
    icon: keyof typeof Ionicons.glyphMap;
    isPassword?: boolean;
}

export default function InkInput({ icon, isPassword = false, ...props }: InkInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const secureTextEntry = isPassword && !isPasswordVisible;

    // We removed 'transition-all' to prevent the render crash.
    // We use conditional border colors instead.
    return (
        <View
            className={`flex-row items-center bg-zinc-50 border rounded-3xl px-5 py-5 ${isFocused ? 'border-black bg-white' : 'border-zinc-100'
                }`}
        >
            <Ionicons
                name={icon}
                size={22}
                color={isFocused ? '#000' : '#a1a1aa'}
            />

            <TextInput
                {...props}
                className="flex-1 ml-4 text-black text-lg font-medium"
                placeholderTextColor="#a1a1aa"
                cursorColor="#000"
                secureTextEntry={secureTextEntry}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus && props.onFocus(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    props.onBlur && props.onBlur(e);
                }}
            />

            {isPassword && (
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Ionicons
                        name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color={isFocused ? '#000' : '#a1a1aa'}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}