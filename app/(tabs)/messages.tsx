import { getAllMessagesData } from "@/services/api";
import useAuthStore from "@/store/authStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
    message_id: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    saved?: boolean;
    file_url: string;
    delivered_timestamp?: string | null;
    read_timestamp?: string | null;
    file_name: string | null;
    file_size: string | null;
    reply_to: number | null;
    image_height: number | null;
    image_width: number | null;
};

type MessagesType = Record<string, Message[]>;
type User = { id: number; username: string; profile_picture: string; isOnline: Boolean };

export default function Messages() {
    const currentUser = useAuthStore((state) => state.user);

    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<MessagesType>({});

    const fetchData = async () => {
        try {
            const res = await getAllMessagesData(currentUser.id);
            const users = res.data.users;
            let messages = res.data.messages;

            const updatedMessages = Object.keys(messages).reduce((acc, userId) => {
                acc[userId] = messages[userId].map((msg: MessagesType) => ({
                    ...msg,
                    saved: !!msg.message_id,
                    delivered: msg.delivered,
                }));
                return acc;
            }, {} as Record<string, any[]>);

            setUsers(users);
            setMessages(updatedMessages);
        } catch (error) {
            console.error("Failed to fetch users and messages:", error);
        }
    };

    console.log(messages);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [currentUser?.id])
    );

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
            <Text style={{ color: "#ffffff", fontSize: 22, marginBottom: 20 }}>Profile Page</Text>
        </SafeAreaView>
    );
}
