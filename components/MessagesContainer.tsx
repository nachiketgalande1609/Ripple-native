import React, { useEffect, useRef } from "react";
import useAuthStore from "@/store/authStore";
import { View, FlatList, Text, StyleSheet, Image, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import MessageInput from "./MessageInput";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (flatListRef.current && messages[selectedUser.id]?.length) {
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 99999, animated: false });
            }, 0);
        }
    }, [selectedUser, messages[selectedUser.id]]);

    useEffect(() => {
        const keyboardListener = Keyboard.addListener("keyboardDidShow", () => {
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 99999, animated: false });
            }, 10);
        });

        return () => keyboardListener.remove(); // Cleanup listener
    }, []);

    const getStatusIcon = (item: Message) => {
        if (item.read) return <MaterialCommunityIcons name="check-all" size={16} color="#2196F3" />;
        if (item.delivered) return <MaterialCommunityIcons name="check-all" size={16} color="#bbb" />;
        return <MaterialCommunityIcons name="check" size={16} color="#bbb" />;
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages[selectedUser.id] || []}
                        keyExtractor={(item) => item.message_id.toString()}
                        renderItem={({ item }) => {
                            const isCurrentUser = item.sender_id === currentUser.id;
                            return (
                                <View style={[styles.messageWrapper, isCurrentUser && styles.currentUserWrapper]}>
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
                                                                item.image_width && item.image_height
                                                                    ? (item.image_width / item.image_height) * 300
                                                                    : undefined,
                                                        },
                                                    ]}
                                                    resizeMode="contain"
                                                />
                                                <Text style={styles.messageText}>{item.message_text}</Text>
                                            </>
                                        ) : (
                                            <Text style={styles.messageText}>{item.message_text}</Text>
                                        )}
                                        <Text style={styles.timestampText}>
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                                        </Text>
                                    </View>
                                    {isCurrentUser && <Text style={styles.statusIcon}>{getStatusIcon(item)}</Text>}
                                </View>
                            );
                        }}
                        onContentSizeChange={() => {
                            if (flatListRef.current) {
                                flatListRef.current.scrollToOffset({ offset: 99999, animated: false });
                            }
                        }}
                    />
                    <MessageInput inputMessage={inputMessage} setInputMessage={setInputMessage} handleSendMessage={handleSendMessage} />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    messageWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        maxWidth: "80%",
    },
    currentUserWrapper: {
        alignSelf: "flex-end",
        flexDirection: "row",
    },
    messageItem: {
        paddingVertical: 8,
        paddingHorizontal: 10,
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
        alignSelf: "flex-end",
    },
    statusIcon: {
        fontSize: 12,
        color: "#bbb",
        marginLeft: 5, // Push read receipt outside the message bubble
    },
    readColor: {
        color: "#2196F3", // Blue for read messages
    },
    currentUserMessage: {
        backgroundColor: "#1976D2",
    },
    otherUserMessage: {
        backgroundColor: "#202327",
    },
    messageText: {
        color: "#fff",
        fontSize: 14,
    },
});
