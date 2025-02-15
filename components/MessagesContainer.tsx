import useAuthStore from "@/store/authStore";
import React from "react";
import { View, FlatList, Text, StyleSheet, Image } from "react-native";
import MessageInput from "./MessageInput";

type Message = {
    message_id: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    saved?: boolean;
    file_url?: string | null;
    delivered_timestamp?: string | null;
    read_timestamp?: string | null;
    file_name?: string | null;
    file_size?: string | null;
    reply_to?: number | null;
    image_height?: number | null;
    image_width?: number | null;
};

type MessagesType = Record<string, Message[]>;
type User = { id: number; username: string; profile_picture: string; isOnline: Boolean };

interface MessageContainerProps {
    messages: MessagesType;
    selectedUser: User;
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
}

export default function MessagesContainer({ messages, selectedUser, inputMessage, setInputMessage, handleSendMessage }: MessageContainerProps) {
    const currentUser = useAuthStore((state) => state.user);

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={messages[selectedUser.id] || []}
                keyExtractor={(item) => item.message_id.toString()}
                renderItem={({ item }) => {
                    const isCurrentUser = item.sender_id === currentUser.id;
                    return (
                        <View style={[styles.messageItem, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                            {item.file_url ? (
                                <>
                                    <Image
                                        source={{ uri: item.file_url }}
                                        style={[
                                            styles.messageImage,
                                            {
                                                height: 300,
                                                width:
                                                    item.image_width && item.image_height ? (item.image_width / item.image_height) * 300 : undefined,
                                            },
                                        ]}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.messageText}>{item.message_text}</Text>
                                </>
                            ) : (
                                <Text style={styles.messageText}>{item.message_text}</Text>
                            )}
                            <Text style={[styles.timestampText, { alignSelf: item.sender_id === currentUser.id ? "flex-start" : "flex-end" }]}>
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                            </Text>
                        </View>
                    );
                }}
            />

            {/* Message Input Box */}
            <MessageInput inputMessage={inputMessage} setInputMessage={setInputMessage} handleSendMessage={handleSendMessage} />
        </View>
    );
}

const styles = StyleSheet.create({
    messageItem: {
        maxWidth: "80%",
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
    },
    messageImage: {
        borderRadius: 10,
        marginTop: 5,
    },
    timestampText: {
        fontSize: 12,
        color: "#bbb",
        marginTop: 4,
    },
    currentUserMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#1976D2",
    },
    otherUserMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#202327",
    },
    messageText: {
        color: "#fff",
        fontSize: 14,
    },
});
