import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "@/store/authStore";
import { View, FlatList, Text, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity } from "react-native";
import MessageInput from "./MessageInput";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "react-native-modal";

type Message = {
    message_id: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered_timestamp?: string | null;
    read_timestamp?: string | null;
};

type MessagesType = Record<string, Message[]>;
type User = { id: number; username: string; profile_picture: string; isOnline: boolean };

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
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isDrawerOpen, setDrawerOpen] = useState(false);

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

        return () => keyboardListener.remove();
    }, []);

    const handleLongPress = (message: Message) => {
        setSelectedMessage(message);
        setDrawerOpen(true);
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
                                <TouchableWithoutFeedback onLongPress={() => handleLongPress(item)}>
                                    <View style={[styles.messageWrapper, isCurrentUser && styles.currentUserWrapper]}>
                                        <View style={[styles.messageItem, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                                            <Text style={styles.messageText}>{item.message_text}</Text>
                                            <Text style={styles.timestampText}>
                                                {new Date(item.timestamp).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            );
                        }}
                    />
                    <MessageInput inputMessage={inputMessage} setInputMessage={setInputMessage} handleSendMessage={handleSendMessage} />

                    {/* Message Details Drawer */}
                    <Modal
                        isVisible={isDrawerOpen}
                        onBackdropPress={() => setDrawerOpen(false)}
                        animationIn="slideInRight"
                        animationOut="slideOutRight"
                        backdropOpacity={0.3}
                        style={styles.drawerModal}
                    >
                        <View style={styles.drawerContainer}>
                            <View style={styles.messageDetailsHeader}>
                                <Text style={styles.drawerTitle}>Message Details</Text>
                                <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                                    <MaterialCommunityIcons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            {selectedMessage && (
                                <>
                                    <View style={styles.detailBox}>
                                        <MaterialCommunityIcons name="check" size={18} color="#fff" />
                                        <View>
                                            <Text style={styles.statusLabel}>Sent</Text>
                                            <Text style={styles.detailText}>
                                                {new Date(selectedMessage.timestamp).toLocaleString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </Text>
                                        </View>
                                    </View>

                                    {selectedMessage.delivered_timestamp && (
                                        <View style={styles.detailBox}>
                                            <MaterialCommunityIcons name="check-all" size={18} color="#ccc" />
                                            <View>
                                                <Text style={styles.statusLabel}>Delivered</Text>
                                                <Text style={styles.detailText}>
                                                    {new Date(selectedMessage.delivered_timestamp).toLocaleString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {selectedMessage.read_timestamp && (
                                        <View style={styles.detailBox}>
                                            <MaterialCommunityIcons name="check-all" size={18} color="#38acff" />
                                            <View>
                                                <Text style={styles.statusLabel}>Read</Text>
                                                <Text style={styles.detailText}>
                                                    {new Date(selectedMessage.read_timestamp).toLocaleString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </Modal>
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
    },
    messageItem: {
        padding: 10,
        borderRadius: 10,
    },
    timestampText: {
        fontSize: 12,
        color: "#bbb",
        marginTop: 4,
        alignSelf: "flex-end",
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
    drawerModal: {
        margin: 0,
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    drawerContainer: {
        width: "55%",
        backgroundColor: "#202327",
        height: "100%",
        padding: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    drawerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    detailBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "hsl(214, 10%, 11%)",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        gap: 10,
    },
    statusLabel: {
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    detailText: {
        color: "#bbb",
        fontSize: 14,
    },
    messageDetailsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 12,
    },
});
