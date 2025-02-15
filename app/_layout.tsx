import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import useAuthStore from "@/store/authStore";
import socket from "@/services/socket";
import { getNotificationsCount } from "@/services/api";
import useNotificationMessagesStore from "@/store/unreadNotificationAndMessagesStore";

const TOKEN_KEY = "authToken";

export default function RootLayout() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const currentUser = useAuthStore((state) => state.user);

    const { setUnreadNotificationsCount, setUnreadMessagesCount } = useNotificationMessagesStore();

    if (currentUser && currentUser.id) {
        socket.emit("registerUser", currentUser.id);
    }

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem(TOKEN_KEY);

            if (!token || !currentUser) {
                router.replace("/auth/login");
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const fetchNotificationCount = async () => {
            try {
                const response = await getNotificationsCount(currentUser.id);
                if (response?.success) {
                    setUnreadNotificationsCount(response?.data?.unread_notifications);
                    setUnreadMessagesCount(response?.data?.unread_messages);
                }
            } catch (error) {
                console.error("Error fetching notification count:", error);
            }
        };

        fetchNotificationCount();
    }, [currentUser]);

    useEffect(() => {
        socket.on("unreadMessagesCount", (data) => {
            setUnreadMessagesCount(data.unreadCount);
        });

        return () => {
            socket.off("unreadMessagesCount");
        };
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const handleUnreadCountResponse = (data: { targetUserId: string; unreadCount: number }) => {
            const { targetUserId, unreadCount } = data;
            if (targetUserId === currentUser.id) {
                setUnreadNotificationsCount(unreadCount);
            }
        };

        socket.on("unreadCountResponse", handleUnreadCountResponse);

        return () => {
            socket.off("unreadCountResponse", handleUnreadCountResponse);
        };
    }, [currentUser, setUnreadNotificationsCount]);

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
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/register" />
            </Stack>
        </View>
    );
}
