import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerLayoutAndroid } from "react-native";
import useAuthStore from "@/store/authStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { getAllMessagesData, shareChatMedia } from "@/services/api";
import MessagesContainer from "@/components/MessagesContainer";
import socket from "@/services/socket";
import useNotificationMessagesStore from "@/store/unreadNotificationAndMessagesStore";
import * as DocumentPicker from "expo-document-picker";

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
type User = { id: number; username: string; profile_picture: string; isOnline: boolean };

export default function Messages() {
    const currentUser = useAuthStore((state) => state.user);

    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<MessagesType>({});
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [inputMessage, setInputMessage] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [typingUser, setTypingUser] = useState<number | null>(null);

    const drawerRef = useRef<DrawerLayoutAndroid>(null);
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

    const { unreadMessagesCount, setUnreadMessagesCount } = useNotificationMessagesStore();

    const fetchData = async () => {
        try {
            const res = await getAllMessagesData(currentUser.id);
            const users = res.data.users;
            let messages = res.data.messages;

            const updatedMessages = Object.keys(messages).reduce(
                (acc, userId) => {
                    acc[userId] = messages[userId].map((msg: MessagesType) => ({
                        ...msg,
                        saved: !!msg.message_id,
                        delivered: msg.delivered,
                    }));
                    return acc;
                },
                {} as Record<string, any[]>
            );

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
        if ((!inputMessage.trim() && !selectedFile) || !selectedUser) return;

        let fileUrl = null;
        let fileName = null;
        let fileSize = null;
        let imageWidth = null;
        let imageHeight = null;
        let reply_to = null;

        if (selectedFile) {
            const formData = new FormData();

            // Convert the selected file into a format that FormData can accept
            if (selectedFile.assets?.[0]) {
                const { uri, mimeType, name, size } = selectedFile.assets[0];

                formData.append("image", {
                    uri,
                    name: name || "uploaded_file",
                    type: mimeType || "application/octet-stream",
                } as any);
            }

            try {
                setIsSendingMessage(true);
                const response = await shareChatMedia(formData);
                fileUrl = response?.data?.fileUrl;
                fileName = response?.data?.fileName;
                fileSize = response?.data?.fileSize;
                imageWidth = response?.data?.imageWidth;
                imageHeight = response?.data?.imageHeight;
            } catch (error) {
                console.error("Image upload failed:", error);
                return;
            } finally {
                setIsSendingMessage(false);
            }
        }

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
        socket.on("typing", (data) => {
            if (data.receiverId === currentUser.id && selectedUser?.id === data.senderId) {
                setTypingUser(data.senderId);
            }
        });

        socket.on("stopTyping", (data) => {
            if (data.receiverId === currentUser.id && selectedUser?.id === data.senderId) {
                setTypingUser(null);
            }
        });

        return () => {
            socket.off("typing");
            socket.off("stopTyping");
        };
    }, [currentUser, selectedUser]);

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

    useEffect(() => {
        socket.on("messageSaved", (data: { tempId: number; messageId: number }) => {
            setMessages((prevMessages) => {
                const newMessages = { ...prevMessages };

                Object.keys(newMessages).forEach((userId) => {
                    newMessages[userId] = newMessages[userId].map((msg) =>
                        msg.message_id === data.tempId ? { ...msg, message_id: data.messageId, saved: true } : msg
                    );
                });

                return newMessages;
            });
        });

        return () => {
            socket.off("messageSaved");
        };
    }, []);

    useEffect(() => {
        socket.on("messageDelivered", (data: { messageId: number; deliveredTimestamp: string | null }) => {
            setMessages((prevMessages) => {
                const newMessages = { ...prevMessages };

                Object.keys(newMessages).forEach((userId) => {
                    newMessages[userId] = newMessages[userId].map((msg) =>
                        msg.message_id === data.messageId ? { ...msg, delivered: true, delivered_timestamp: data.deliveredTimestamp } : msg
                    );
                });

                return newMessages;
            });
        });

        return () => {
            socket.off("messageDelivered");
        };
    }, []);

    useEffect(() => {
        if (selectedUser && messages[selectedUser.id]) {
            const unreadMessages = messages[selectedUser.id].filter((msg) => msg.sender_id === selectedUser.id && !msg.read);

            if (unreadMessages.length > 0) {
                const messageIds = unreadMessages.map((msg) => msg.message_id).filter((id) => !!id);

                if (messageIds.length > 0) {
                    socket.emit("messageRead", {
                        senderId: selectedUser.id,
                        receiverId: currentUser.id,
                        messageIds,
                    });

                    setMessages((prevMessages) => {
                        const updatedMessages = { ...prevMessages };
                        updatedMessages[selectedUser.id] = updatedMessages[selectedUser.id].map((msg) =>
                            messageIds.includes(msg.message_id) ? { ...msg, read: true } : msg
                        );
                        return updatedMessages;
                    });

                    const newUnreadCount = Math.max((unreadMessagesCount || 0) - unreadMessages.length, 0);
                    setUnreadMessagesCount(newUnreadCount);
                }
            }
        }
    }, [selectedUser, messages]);

    useEffect(() => {
        socket.on("messageRead", (data: { receiverId: number; messageIds: { messageId: number; readTimestamp: string }[] }) => {
            setMessages((prevMessages) => {
                const updatedMessages = { ...prevMessages };

                if (updatedMessages[data.receiverId]) {
                    updatedMessages[data.receiverId] = updatedMessages[data.receiverId].map((msg) => {
                        const readMessage = data.messageIds.find((m) => m.messageId === msg.message_id);
                        return readMessage ? { ...msg, read: true, read_timestamp: readMessage.readTimestamp } : msg;
                    });
                }

                return updatedMessages;
            });
        });

        return () => {
            socket.off("messageRead");
        };
    }, []);

    const getLastMessageText = (lastMessage: Message | undefined) => {
        if (!lastMessage) return "No messages yet";

        if (lastMessage.message_text) {
            return lastMessage.message_text.trim();
        }

        if (lastMessage.file_url) {
            const fileType = lastMessage.file_name?.split(".").pop()?.toLowerCase();

            if (!fileType) return "[File]";

            const fileTypeMapping: Record<string, { icon: JSX.Element; label: string }> = {
                jpg: { icon: <Ionicons name="image" size={16} color="#aaa" />, label: "Image" },
                jpeg: { icon: <Ionicons name="image" size={16} color="#aaa" />, label: "Image" },
                png: { icon: <Ionicons name="image" size={16} color="#aaa" />, label: "Image" },
                gif: { icon: <Ionicons name="image" size={16} color="#aaa" />, label: "Image" },
                mp4: { icon: <Ionicons name="videocam" size={16} color="#aaa" />, label: "Video" },
                mov: { icon: <Ionicons name="videocam" size={16} color="#aaa" />, label: "Video" },
                avi: { icon: <Ionicons name="videocam" size={16} color="#aaa" />, label: "Video" },
                mp3: { icon: <Ionicons name="musical-note" size={16} color="#aaa" />, label: "Audio" },
                wav: { icon: <Ionicons name="musical-note" size={16} color="#aaa" />, label: "Audio" },
                pdf: { icon: <Ionicons name="document" size={16} color="#aaa" />, label: "PDF" },
                doc: { icon: <Ionicons name="document" size={16} color="#aaa" />, label: "Document" },
                docx: { icon: <Ionicons name="document" size={16} color="#aaa" />, label: "Document" },
                xls: { icon: <Ionicons name="document" size={16} color="#aaa" />, label: "Spreadsheet" },
                xlsx: { icon: <Ionicons name="document" size={16} color="#aaa" />, label: "Spreadsheet" },
                ppt: { icon: <Ionicons name="document" size={16} color="#aaa" />, label: "Presentation" },
                pptx: { icon: <Ionicons name="document" size={16} color="#aaa" />, label: "Presentation" },
            };

            const fileData = fileTypeMapping[fileType] || { icon: <Ionicons name="document" size={16} color="#aaa" />, label: "[File]" };

            return (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    {fileData.icon}
                    <Text style={{ color: "#aaa" }}>{fileData.label}</Text>
                </View>
            );
        }

        return "No messages yet";
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
                        renderItem={({ item }) => {
                            const userMessages = messages[item.id] || [];
                            const latestMessage = getLastMessageText(userMessages[userMessages.length - 1]);
                            const unreadCount = userMessages.filter((msg) => msg.sender_id === item.id && !msg.read).length;

                            return (
                                <TouchableOpacity
                                    style={[styles.userItem, selectedUser?.id === item.id && styles.selectedUserItem]}
                                    onPress={() => selectUser(item)}
                                >
                                    <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.userText}>{item.username}</Text>
                                        <Text style={styles.latestMessage} numberOfLines={1}>
                                            {latestMessage}
                                        </Text>
                                    </View>

                                    {/* Show unread count only if there are unread messages */}
                                    {unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadText}>{unreadCount}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
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
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            isSendingMessage={isSendingMessage}
                            typingUser={typingUser}
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
    latestMessage: {
        color: "#aaa",
        fontSize: 14,
        marginTop: 1,
    },

    profileImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 8,
    },
    unreadBadge: {
        backgroundColor: "#1976D2",
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: "auto",
        minWidth: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    unreadText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
});
