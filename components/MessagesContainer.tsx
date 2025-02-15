import useAuthStore from "@/store/authStore";
import React, { useState } from "react";
import { View, FlatList, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

interface MessageContainerProps {
    messages: MessagesType;
    selectedUser: User;
}

export default function MessagesContainer({ messages, selectedUser }: MessageContainerProps) {
    const currentUser = useAuthStore((state) => state.user);
    const [message, setMessage] = useState("");

    const sendMessage = () => {
        if (message.trim()) {
            console.log("Sending message:", message);
            setMessage(""); // Clear input after sending
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={messages[selectedUser.id] || []}
                keyExtractor={(item) => item.message_id.toString()}
                renderItem={({ item }) => {
                    const isCurrentUser = item.sender_id === currentUser.id;
                    return (
                        <View style={[styles.messageItem, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                            <Text style={styles.messageText}>{item.message_text}</Text>
                        </View>
                    );
                }}
            />

            {/* Message Input Box */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#888"
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Ionicons name="send" size={20} color="#1976D2" />
                </TouchableOpacity>
            </View>
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
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderTopWidth: 0.5,
        borderTopColor: "#202327",
        backgroundColor: "#000000",
    },
    input: {
        flex: 1,
        color: "white",
        padding: 10,
        backgroundColor: "#000000",
        borderRadius: 20,
        marginRight: 10,
    },
    sendButton: {
        padding: 10,
        borderRadius: 20,
    },
});
