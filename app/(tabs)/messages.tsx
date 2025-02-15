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
                <SafeAreaView style={styles.drawerContainer}>
                    <Text style={styles.drawerHeading}>Select a User</Text>
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.userItem} onPress={() => selectUser(item)}>
                                <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
                                <Text style={styles.userText}>{item.username}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </SafeAreaView>
            )}
        >
            <SafeAreaView style={styles.container}>
                {/* Top Bar with Chevron */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={openDrawer}>
                        <Ionicons name="chevron-forward" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.topBarTitle}>{selectedUser ? selectedUser.username : "Messages"}</Text>
                </View>

                {/* Messages View */}
                <View style={styles.messagesContainer}>
                    {selectedUser ? (
                        <FlatList
                            data={messages[selectedUser.id] || []}
                            keyExtractor={(item) => item.message_id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.messageItem}>
                                    <Text style={styles.messageText}>{item.message_text}</Text>
                                </View>
                            )}
                        />
                    ) : (
                        <Text style={styles.noUserText}>Select a user to start chatting</Text>
                    )}
                </View>
            </SafeAreaView>
        </DrawerLayoutAndroid>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
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
        backgroundColor: "#222",
        padding: 15,
        marginVertical: 5,
        borderRadius: 5,
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
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: "#202327",
        marginVertical: 5,
    },
    userText: {
        color: "#ffffff",
        fontSize: 18,
    },
    profileImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 8,
    },
});
