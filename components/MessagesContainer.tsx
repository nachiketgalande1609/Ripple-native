import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "@/store/authStore";
import {
    View,
    FlatList,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableOpacity,
    Image,
    Linking,
} from "react-native";
import MessageInput from "./MessageInput";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "react-native-modal";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { Video } from "expo-av";

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

interface MessageContainerProps {
    messages: MessagesType;
    selectedUser: User;
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
    selectedFile: DocumentPicker.DocumentPickerResult | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<DocumentPicker.DocumentPickerResult | null>>;
    isSendingMessage: boolean;
}

export default function MessagesContainer({
    messages,
    selectedUser,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    selectedFile,
    setSelectedFile,
    isSendingMessage,
}: MessageContainerProps) {
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

    const playAudio = async (url: string) => {
        const { sound } = await Audio.Sound.createAsync({ uri: url });
        await sound.playAsync();
    };

    const openDocument = async (url: string) => {
        Linking.openURL(url);
    };

    const formatFileSize = (sizeInBytes: number | null) => {
        if (!sizeInBytes) return "Unknown size";

        const size = Number(sizeInBytes); // Ensure it's a number
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

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
                                <TouchableWithoutFeedback onLongPress={() => handleLongPress(item)}>
                                    <View style={[styles.messageWrapper, isCurrentUser && styles.currentUserWrapper]}>
                                        <View style={[styles.messageItem, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                                            {item.file_url ? (
                                                item.file_url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                                    <Image source={{ uri: item.file_url }} style={styles.imageStyle} />
                                                ) : item.file_url.match(/\.(mp4|mov|avi)$/i) ? (
                                                    <Video source={{ uri: item.file_url }} style={styles.videoStyle} useNativeControls />
                                                ) : item.file_url.match(/\.(mp3|wav|ogg)$/i) ? (
                                                    <TouchableOpacity onPress={() => playAudio(item.file_url)}>
                                                        <MaterialCommunityIcons name="play-circle-outline" size={40} color="white" />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity onPress={() => openDocument(item.file_url)} style={styles.fileContainer}>
                                                        <MaterialCommunityIcons
                                                            name={item.file_url.match(/\.(pdf)$/i) ? "file-pdf-box" : "file"}
                                                            size={40}
                                                            color={item.file_url.match(/\.(pdf)$/i) ? "red" : "#FFD013"}
                                                        />
                                                        <View style={styles.fileInfo}>
                                                            <Text numberOfLines={1} style={styles.fileName}>
                                                                {item.file_name || "Download File"}
                                                            </Text>
                                                            <Text style={styles.fileSize}>{formatFileSize(parseInt(item.file_size ?? "0", 10))}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            ) : (
                                                <Text style={styles.messageText}>{item.message_text}</Text>
                                            )}

                                            {/* Timestamp inside message bubble */}
                                            <Text style={styles.timestampText}>
                                                {new Date(item.timestamp).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </Text>
                                        </View>

                                        {/* Status icon for current user messages */}
                                        {isCurrentUser && <Text style={styles.statusIcon}>{getStatusIcon(item)}</Text>}
                                    </View>
                                </TouchableWithoutFeedback>
                            );
                        }}
                    />
                    <MessageInput
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        handleSendMessage={handleSendMessage}
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                        isSendingMessage={isSendingMessage}
                    />

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
        alignItems: "baseline",
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
    imageStyle: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginVertical: 5,
    },
    videoStyle: {
        width: 250,
        height: 150,
        borderRadius: 10,
    },
    fileName: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    fileContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#202327",
        borderRadius: 10,
        width: 200,
    },
    fileInfo: {
        marginLeft: 2,
        flexShrink: 1,
    },
    fileSize: {
        color: "#bbb",
        fontSize: 12,
    },
    statusIcon: {
        fontSize: 12,
        color: "#bbb",
        marginLeft: 5,
    },
});
