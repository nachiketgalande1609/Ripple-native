import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { timeAgo } from "@/utils/utils";

interface Notification {
    id: number;
    type: string;
    message: string;
    post_id: number | null;
    created_at: string;
    sender_id: string;
    username: string;
    profile_picture: string;
    file_url?: string;
    request_status: string;
    requester_id?: number;
    request_id: number;
}

interface NotificationCardProps {
    notification: Notification;
    onFollowBack: (userId: string) => void;
    onFollowRequestResponse: (request_id: number, response: "accepted" | "rejected") => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onFollowBack, onFollowRequestResponse }) => {
    const router = useRouter();

    const handleProfileNavigation = () => {
        router.replace("../(tabs)/profile");
    };

    return (
        <View style={styles.card}>
            {/* Profile Picture Clickable */}
            <TouchableOpacity onPress={handleProfileNavigation}>
                <Image source={{ uri: notification.profile_picture }} style={styles.avatar} />
            </TouchableOpacity>

            <View style={styles.textContainer}>
                {/* Username Clickable */}
                <TouchableOpacity onPress={handleProfileNavigation}>
                    <Text style={styles.username}>{notification.username}</Text>
                </TouchableOpacity>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.timestamp}>{timeAgo(notification.created_at)}</Text>
            </View>

            {notification.type === "follow" && (
                <Button
                    mode="outlined"
                    onPress={() => {
                        if (notification.request_status !== "pending") onFollowBack(notification.sender_id);
                    }}
                    disabled={notification.request_status === "pending"}
                    style={styles.button}
                >
                    {notification.request_status === "accepted" ? "Following" : "Follow Back"}
                </Button>
            )}

            {notification.type === "follow_request" && (
                <View style={styles.buttonContainer}>
                    {notification.request_status === "pending" ? (
                        <>
                            <Button
                                mode="outlined"
                                onPress={() => onFollowRequestResponse(notification.request_id, "accepted")}
                                style={styles.button}
                            >
                                Accept
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => onFollowRequestResponse(notification.request_id, "rejected")}
                                style={styles.button}
                            >
                                Reject
                            </Button>
                        </>
                    ) : (
                        <Button mode="outlined" compact style={styles.button} labelStyle={styles.buttonText}>
                            {notification.request_status === "accepted" ? "Accepted" : "Rejected"}
                        </Button>
                    )}
                </View>
            )}

            {(notification.type === "like" || notification.type === "comment") && notification.file_url && (
                <Image source={{ uri: notification.file_url }} style={styles.postImage} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#161b1d",
        padding: 12,
        marginBottom: 10,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
    },
    message: {
        fontSize: 14,
        color: "white",
    },
    timestamp: {
        fontSize: 12,
        color: "gray",
    },
    button: {
        borderRadius: 20,
        marginLeft: 5,
        borderColor: "#5b5b5b",
        borderWidth: 0.5,
        paddingHorizontal: 8,
        justifyContent: "center",
    },
    buttonText: {
        color: "#5b5b5b",
        fontSize: 12,
        fontWeight: "bold",
        textAlignVertical: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    postImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginLeft: 10,
    },
});

export default NotificationCard;
