import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

const TOKEN_KEY = "authToken";

export default function RootLayout() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) {
                router.replace("/auth/login");
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
                <ActivityIndicator size="large" color="#7a60ff" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)/_layout" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/register" />
            </Stack>
        </View>
    );
}
