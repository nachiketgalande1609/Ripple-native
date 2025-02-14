import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from "react-native";
import { getNotifications, followUser, respondToFollowRequest } from "../../services/api";
import useAuthStore from "@/store/authStore";
import NotificationCard from "../../components/notificationCard";
import { useFocusEffect } from "expo-router";

interface Notification {
    id: number;
    type: string;
    message: string;
    post_id: number | null;
    created_at: string;
    sender_id: string;
    username: string;
    profile_picture: string;
    file_url?: string;
    request_status: string;
    requester_id?: number;
    request_id: number;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const currentUser = useAuthStore((state) => state.user);

    async function fetchNotifications() {
        if (!currentUser?.id) return;
        try {
            setLoading(true);
            const res = await getNotifications(currentUser.id);
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, [currentUser?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [currentUser?.id])
    );

    const handleFollowBack = async (userId: string) => {
        if (!currentUser?.id || !userId) return;
        try {
            setLoading(true);
            const res = await followUser(currentUser.id.toString(), userId);
            if (res?.success) await fetchNotifications();
        } catch (error) {
            console.error("Failed to follow the user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowRequestResponse = async (request_id: number, response: "accepted" | "rejected") => {
        try {
            setLoading(true);
            const res = await respondToFollowRequest(request_id, response);
            if (res?.success) await fetchNotifications();
        } catch (error) {
            console.error(`Failed to ${response} the follow request:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
            ) : notifications.length === 0 ? (
                <Text style={styles.noNotifications}>No new notifications.</Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <NotificationCard notification={item} onFollowBack={handleFollowBack} onFollowRequestResponse={handleFollowRequestResponse} />
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#000000",
    },
    noNotifications: {
        textAlign: "center",
        color: "gray",
        marginTop: 20,
        fontSize: 16,
    },
});

export default NotificationsPage;
