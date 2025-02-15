import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // For the chevron icon
import { DrawerLayoutAndroid } from "react-native";
import useAuthStore from "@/store/authStore";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useEffect } from "react";
import { getAllMessagesData } from "@/services/api";

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
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
        drawerRef.current?.openDrawer();
    };

    const closeDrawer = () => {
        drawerRef.current?.closeDrawer();
    };

    const selectUser = (user: User) => {
        setSelectedUser(user);
        closeDrawer();
    };

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
    },
    messageItem: {
        maxWidth: "80%",
        padding: 15,
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
