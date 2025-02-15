import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerLayoutAndroid } from "react-native";
import useAuthStore from "@/store/authStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { getAllMessagesData } from "@/services/api";
import MessagesContainer from "@/components/MessagesContainer";
import socket from "@/services/socket";

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

export default function Messages() {
    const currentUser = useAuthStore((state) => state.user);

    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<MessagesType>({});
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [inputMessage, setInputMessage] = useState("");

    const drawerRef = useRef<DrawerLayoutAndroid>(null);

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

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [currentUser?.id])
    );

    const openDrawer = () => {
        drawerRef.current?.closeDrawer();
        setTimeout(() => {
            drawerRef.current?.openDrawer();
        }, 100);
    };

    const closeDrawer = () => {
        drawerRef.current?.closeDrawer();
    };

    const selectUser = (user: User) => {
        setSelectedUser(user);
        closeDrawer();
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedUser) return;

        let fileUrl = null;
        let fileName = null;
        let fileSize = null;
        let imageWidth = null;
        let imageHeight = null;
        let reply_to = null;

        const tempMessageId = Date.now() + Math.floor(Math.random() * 1000);

        const newMessage = {
            message_id: tempMessageId,
            sender_id: currentUser.id,
            message_text: inputMessage,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            image_width: imageWidth,
            image_height: imageHeight,
            timestamp: new Date().toISOString(),
            saved: false,
            reply_to: reply_to,
        };

        setMessages((prevMessages) => {
            const newMessages = { ...prevMessages };

            if (!newMessages[selectedUser.id]) {
                newMessages[selectedUser.id] = [];
            }

            if (!newMessages[selectedUser.id].some((msg) => msg.message_id === tempMessageId)) {
                newMessages[selectedUser.id].push(newMessage);
            }

            return newMessages;
        });

        socket.emit("sendMessage", {
            tempId: tempMessageId,
            senderId: currentUser.id,
            receiverId: selectedUser.id,
            text: inputMessage,
            fileUrl,
            fileName,
            fileSize,
            imageWidth,
            imageHeight,
            replyTo: reply_to,
        });

        setInputMessage("");
    };

    useEffect(() => {
        socket.on("receiveMessage", (data) => {
            setMessages((prevMessages) => {
                const newMessages = { ...prevMessages };
                const senderId = data.senderId;

                if (!newMessages[senderId]) {
                    fetchData();
                    newMessages[senderId] = [];
                }

                const messageExists = newMessages[senderId].some((message) => message.message_id === data.messageId);

                if (!messageExists) {
                    newMessages[senderId].push({
                        message_id: data.messageId,
                        sender_id: data.senderId,
                        message_text: data.message_text,
                        timestamp: new Date().toISOString(),
                        saved: !!data.message_id,
                        file_url: data?.fileUrl,
                        file_name: data.fileName,
                        file_size: data.fileSize,
                        reply_to: data.replyTo,
                        image_width: data.iamgeWidth,
                        image_height: data.imageHeight,
                    });
                }

                return newMessages;
            });
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [currentUser]);

    return (
        <DrawerLayoutAndroid
            ref={drawerRef}
            drawerWidth={250}
            drawerPosition="left"
            renderNavigationView={() => (
                <View style={styles.drawerContainer}>
                    <View style={styles.drawerHeadingContainer}>
                        <Text style={styles.drawerHeading}>Messages</Text>
                        <TouchableOpacity onPress={closeDrawer}>
                            <Ionicons name="chevron-back" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.userItem, selectedUser?.id === item.id && styles.selectedUserItem]}
                                onPress={() => selectUser(item)}
                            >
                                <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
                                <Text style={styles.userText}>{item.username}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        >
            <View style={styles.container}>
                {/* Top Bar with Chevron */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={openDrawer}>
                        <Ionicons name="chevron-forward" size={20} color="white" />
                    </TouchableOpacity>
                    {selectedUser && (
                        <View style={styles.userInfo}>
                            <Image source={{ uri: selectedUser.profile_picture }} style={styles.topBarImage} />
                            <Text style={styles.topBarTitle}>{selectedUser.username}</Text>
                        </View>
                    )}
                </View>

                {/* Messages View */}
                <View style={styles.messagesContainer}>
                    {selectedUser ? (
                        <MessagesContainer
                            messages={messages}
                            selectedUser={selectedUser}
                            inputMessage={inputMessage}
                            setInputMessage={setInputMessage}
                            handleSendMessage={handleSendMessage}
                        />
                    ) : (
                        <Text style={styles.noUserText}>Select a user to start chatting</Text>
                    )}
                </View>
            </View>
        </DrawerLayoutAndroid>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#202327",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    topBarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    topBarTitle: {
        color: "white",
        fontSize: 20,
        marginLeft: 10,
    },
    messagesContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    noUserText: {
        color: "#888",
        fontSize: 18,
        textAlign: "center",
    },
    drawerContainer: {
        flex: 1,
        backgroundColor: "#111111",
    },
    drawerHeading: {
        color: "#ffffff",
        fontSize: 20,
    },
    drawerHeadingContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 16,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: "#202327",
        marginVertical: 5,
    },
    selectedUserItem: {
        borderRightWidth: 4,
        borderRightColor: "#1976D2",
    },
    userText: {
        color: "#ffffff",
        fontSize: 16,
    },
    profileImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 8,
    },
});
