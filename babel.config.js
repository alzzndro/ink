module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel", // <--- MOVED HERE (It is a preset now)
        ],
        plugins: [
            // "expo-router/babel", // <--- REMOVE THIS (Deprecated in SDK 50+)

            // If you use Reanimated, keep this plugin LAST:
            "react-native-reanimated/plugin",
        ],
    };
};