import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "@/store/authStore";
import {
    View,
    FlatList,
    Text,
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableOpacity,
} from "react-native";
import MessageInput from "./MessageInput";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "react-native-modal";

type Message = {
    message_id: number;
    sender_id: number;
    message_text: string;
    timestamp: string;
    delivered?: boolean;
    read?: boolean;
    delivered_timestamp?: string | null;
    read_timestamp?: string | null;
    file_url?: string | null;
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
                                            {item.file_url ? (
                                                <>
                                                    <Image source={{ uri: item.file_url }} style={styles.messageImage} resizeMode="contain" />
                                                    <Text style={styles.messageText}>{item.message_text}</Text>
                                                </>
                                            ) : (
                                                <Text style={styles.messageText}>{item.message_text}</Text>
                                            )}
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
                            <TouchableOpacity onPress={() => setDrawerOpen(false)} style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.drawerTitle}>Message Details</Text>
                            {selectedMessage && (
                                <>
                                    <Text style={styles.drawerText}>Sent: {new Date(selectedMessage.timestamp).toLocaleString()}</Text>
                                    {selectedMessage.delivered_timestamp && (
                                        <Text style={styles.drawerText}>
                                            Delivered: {new Date(selectedMessage.delivered_timestamp).toLocaleString()}
                                        </Text>
                                    )}
                                    {selectedMessage.read_timestamp && (
                                        <Text style={styles.drawerText}>Read: {new Date(selectedMessage.read_timestamp).toLocaleString()}</Text>
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
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    messageImage: {
        borderRadius: 10,
        height: 300,
        width: "100%",
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
        width: "65%",
        backgroundColor: "#222",
        height: "100%",
        padding: 20,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    drawerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10,
    },
    drawerText: {
        color: "#bbb",
        fontSize: 14,
        marginBottom: 5,
    },
    closeButton: {
        alignSelf: "flex-end",
    },
});
