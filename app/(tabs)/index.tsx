import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button } from "react-native";
import { getPosts } from "../../services/api";
import Post from "../../components/post";
import useAuthStore from "@/store/authStore";

export default function Home() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const currentUser = useAuthStore((state) => state.user);

    const fetchPosts = async () => {
        try {
            const res = await getPosts(currentUser?.id);
            setPosts(res.data);
        } catch (error) {
            console.log("Error fetching posts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
            ) : posts.length > 0 ? (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <Post post={item} userId={10} fetchPosts={fetchPosts} />}
                    contentContainerStyle={styles.postList}
                />
            ) : (
                <View style={styles.noPostsContainer}>
                    <Text style={styles.noPostsText}>No posts available</Text>
                    <Text style={styles.noPostsSubText}>Be the first to share something!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    postList: {
        paddingBottom: 80, // Space for bottom bar
    },
    noPostsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noPostsText: {
        fontSize: 24,
        color: "#ffffff",
    },
    noPostsSubText: {
        fontSize: 14,
        color: "#666666",
    },
});
