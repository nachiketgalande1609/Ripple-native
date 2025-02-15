import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MessageInputProps {
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
}

export default function MessageInput({ inputMessage, setInputMessage, handleSendMessage }: MessageInputProps) {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#888"
                value={inputMessage}
                onChangeText={setInputMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Ionicons name="send" size={20} color="#1976D2" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
