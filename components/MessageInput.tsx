import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Image, Text, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

interface MessageInputProps {
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: (file?: DocumentPicker.DocumentPickerResult | null) => void;
    selectedFile: DocumentPicker.DocumentPickerResult | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<DocumentPicker.DocumentPickerResult | null>>;
    isSendingMessage: boolean;
}

export default function MessageInput({
    inputMessage,
    setInputMessage,
    handleSendMessage,
    selectedFile,
    setSelectedFile,
    isSendingMessage,
}: MessageInputProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAttachFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });

        if (result.canceled) return;
        setSelectedFile(result);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const onSend = () => {
        handleSendMessage(selectedFile);
        setSelectedFile(null);
    };

    return (
        <View style={styles.container}>
            {selectedFile && (
                <View style={styles.previewContainer}>
                    {selectedFile.assets?.[0]?.mimeType?.startsWith("image/") ? (
                        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.imageWrapper}>
                            <Image source={{ uri: selectedFile.assets[0].uri }} style={styles.imagePreview} />
                            <View>
                                <Text style={styles.fileName}>{selectedFile.assets?.[0]?.name}</Text>
                                <Text style={styles.fileExt}>{selectedFile.assets?.[0]?.mimeType?.split("/")[1]}</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View>
                            <Text style={styles.fileName}>{selectedFile.assets?.[0]?.name}</Text>{" "}
                            <Text>{selectedFile.assets?.[0]?.mimeType?.split("/")[1]}</Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={handleRemoveFile} style={styles.removeFileButton}>
                        <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Full-Screen Image Modal */}
            <Modal visible={isModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <Image source={{ uri: selectedFile?.assets?.[0]?.uri }} style={styles.fullScreenImage} resizeMode="contain" />
                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                        <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </Modal>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#888"
                    value={inputMessage}
                    onChangeText={setInputMessage}
                />
                <TouchableOpacity style={styles.attachButton} onPress={handleAttachFile}>
                    <Ionicons name="attach" size={22} color="#1976D2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sendButton} onPress={onSend} disabled={isSendingMessage}>
                    {isSendingMessage ? <ActivityIndicator size="small" color="#1976D2" /> : <Ionicons name="send" size={20} color="#1976D2" />}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        borderTopWidth: 0.5,
        borderTopColor: "#202327",
    },
    previewContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#202327",
    },
    imageWrapper: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        position: "relative",
        alignItems: "center",
    },
    imagePreview: {
        width: 70,
        height: 70,
        borderRadius: 5,
    },
    fileNameContainer: {
        position: "absolute",
        top: -20,
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 5,
        borderRadius: 5,
    },
    fileName: {
        color: "white",
        fontSize: 14,
    },
    removeFileButton: {
        position: "absolute",
        right: 15,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,1)",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    fullScreenImage: {
        width: "90%",
        height: "80%",
    },
    closeButton: {
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    input: {
        flex: 1,
        color: "white",
        padding: 10,
        backgroundColor: "#000",
        borderRadius: 20,
        marginRight: 10,
    },
    attachButton: {
        padding: 10,
    },
    sendButton: {
        padding: 10,
    },
    fileExt: {
        color: "#999999",
    },
});
