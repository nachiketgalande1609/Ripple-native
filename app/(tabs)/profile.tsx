import { useEffect, useState, useCallback } from "react";
import { getProfile, getUserPosts } from "@/services/api";
import { View, Text, StyleSheet, Dimensions, Image, FlatList, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import useAuthStore from "@/store/authStore";
import { useFocusEffect } from "expo-router";

const { width } = Dimensions.get("window");

interface Profile {
    username: string;
    email: string;
    bio?: string;
    profile_picture?: string;
    followers_count: number;
    following_count: number;
    posts_count: number;
    is_request_active: boolean;
    follow_status: string;
    is_following: boolean;
    is_private: boolean;
}

export default function Profile() {
    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<any[]>([]);

    const currentUser = useAuthStore((state) => state.user);

    const userId = 10;

    async function fetchProfile() {
        try {
            if (userId) {
                const res = await getProfile(userId, currentUser?.id);
                setProfileData(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchUserPosts() {
        try {
            if (userId) {
                const res = await getUserPosts(10, userId);
                setPosts(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
            fetchUserPosts();
        }, [userId])
    );

    if (!profileData) {
        return <Text>Loading...</Text>;
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: "#000000" }}>
            <View style={styles.banner}>
                <Svg width="100%" height="300">
                    <Defs>
                        <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="100%" stopColor="hsl(214, 10%, 20%)" />
                            <Stop offset="0%" stopColor="rgb(0, 0, 0)" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="300" fill="url(#gradient)" />
                </Svg>
                <View style={styles.profileContainer}>
                    <Image source={{ uri: profileData.profile_picture || "https://via.placeholder.com/150" }} style={styles.profileImage} />
                    <Text style={styles.username}>{profileData.username}</Text>
                    <Text style={styles.email}>{profileData.email}</Text>
                    <Text style={styles.bio}>{profileData.bio}</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profileData.posts_count}</Text>
                            <Text style={styles.statLabel}>POSTS</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profileData.followers_count}</Text>
                            <Text style={styles.statLabel}>FOLLOWERS</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profileData.following_count}</Text>
                            <Text style={styles.statLabel}>FOLLOWING</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={{ flex: 1 }}>
                <FlatList
                    data={posts}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3}
                    renderItem={({ item }) => (
                        <TouchableOpacity>
                            <Image source={{ uri: item.file_url }} style={styles.postImage} />
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.postsGrid}
                    scrollEnabled={false} // Prevent FlatList from scrolling independently
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: "relative",
        width: "100%",
        height: 290,
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileContainer: {
        position: "absolute",
        alignItems: "center",
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 20,
        borderColor: "#ffffff",
        borderWidth: 3,
    },
    username: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
    email: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    bio: {
        color: "#FFFFFF",
        fontSize: 14,
        marginBottom: 12,
        textAlign: "center",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    statLabel: {
        color: "#888888",
        fontSize: 15,
        fontWeight: "bold",
    },
    postsGrid: {
        paddingTop: 10,
        paddingHorizontal: 5,
    },
    postImage: {
        width: width / 3 - 6,
        height: width / 3 - 6,
        margin: 2,
        borderRadius: 5,
    },
});
