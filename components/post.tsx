import React, { useState, useRef } from "react";
import { View, Text, Image, TextInput, Button, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface PostProps {
    post: any;
    userId: number;
    fetchPosts: () => Promise<void>;
}

const Post: React.FC<PostProps> = ({ post, userId, fetchPosts }) => {
    const [isLiked, setIsLiked] = useState(post.hasUserLikedPost);
    const [commentText, setCommentText] = useState("");
    const [commentCount, setCommentCount] = useState(post.commentCount);
    const [comments, setComments] = useState(post.initialComments);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    const likeAnimation = useRef(new Animated.Value(1)).current;
    const slideAnimation = useRef(new Animated.Value(height)).current;

    const handleLike = async () => {
        setIsLiked(!isLiked);

        // Trigger the like animation
        Animated.sequence([
            Animated.spring(likeAnimation, { toValue: 1.5, useNativeDriver: true }),
            Animated.spring(likeAnimation, { toValue: 1, useNativeDriver: true }),
        ]).start();

        fetchPosts();
    };

    const handleComment = async () => {
        if (commentText) {
            const newComment = {
                id: Date.now(),
                user_id: userId,
                content: commentText,
                created_at: new Date().toISOString(),
                commenter_username: "Current User", // Use actual username
            };
            setComments([newComment, ...comments]);
            setCommentCount(commentCount + 1);
            setCommentText("");
            fetchPosts();
        }
    };

    const handleEditPost = () => {
        setIsEditing(false);
        fetchPosts();
    };

    const handleDeletePost = () => {
        setIsDrawerVisible(false);
        fetchPosts();
    };

    const openCommentDrawer = () => {
        setIsDrawerVisible(true);
        Animated.spring(slideAnimation, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    };

    const closeCommentDrawer = () => {
        Animated.spring(slideAnimation, {
            toValue: height,
            useNativeDriver: true,
        }).start(() => setIsDrawerVisible(false));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Image source={{ uri: post.profile_picture }} style={styles.profilePicture} />
                    <Text style={styles.username}>{post.username}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsDrawerVisible(true)}>
                    <MaterialCommunityIcons name="dots-vertical" size={20} style={{ marginRight: 5 }} color="white" />
                </TouchableOpacity>
            </View>

            {/* Post Image */}
            {post.file_url && (
                <TouchableOpacity>
                    <Image source={{ uri: post.file_url }} style={styles.image} />
                </TouchableOpacity>
            )}

            {/* Post Actions */}
            <View style={styles.actions}>
                <TouchableOpacity onPress={handleLike}>
                    <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
                        <MaterialCommunityIcons name={isLiked ? "heart" : "heart-outline"} size={30} color={isLiked ? "red" : "white"} />
                    </Animated.View>
                </TouchableOpacity>
                <Text style={styles.likeCount}>{post.likeCount}</Text>

                <TouchableOpacity onPress={openCommentDrawer}>
                    <MaterialCommunityIcons name="comment-outline" size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.commentCount}>{commentCount}</Text>
            </View>

            {/* Post Caption */}
            {isEditing ? (
                <View style={styles.editSection}>
                    <TextInput style={styles.textInput} value={editedContent} onChangeText={setEditedContent} multiline />
                    <Button title="Save" onPress={handleEditPost} />
                </View>
            ) : (
                <View style={styles.contentContainer}>
                    <Text style={styles.username}>{post.username}</Text>
                    <Text style={styles.content}>{post.content}</Text>
                </View>
            )}

            {/* Comments Drawer (Modal) */}
            {isDrawerVisible && (
                <Animated.View style={[styles.drawer, { transform: [{ translateY: slideAnimation }] }]}>
                    <View style={styles.commentSection}>
                        <TextInput style={styles.commentInput} value={commentText} onChangeText={setCommentText} placeholder="Add a comment..." />
                        <Button title="Post" onPress={handleComment} />
                    </View>
                    <View style={styles.commentsList}>
                        {post.comments.map((comment: any) => (
                            <View key={comment.id} style={styles.comment}>
                                <Text style={styles.commentUsername}>{comment.commenter_username}</Text>
                                <Text style={styles.commentContent}>{comment.content}</Text>
                            </View>
                        ))}
                    </View>
                    <Button title="Close" onPress={closeCommentDrawer} />
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000000",
        marginBottom: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: "center",
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    contentContainer: {
        paddingHorizontal: 14,
        paddingVertical: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    username: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 5,
    },
    content: {
        color: "#ffffff",
        fontSize: 14,
    },

    image: {
        width: width,
        height: width,
    },
    actions: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 5,
    },
    likeCount: {
        color: "#ffffff",
        fontSize: 14,
    },
    commentCount: {
        color: "#ffffff",
        fontSize: 14,
    },
    commentSection: {
        flexDirection: "row",
        marginTop: 8,
        padding: 16,
    },
    commentInput: {
        flex: 1,
        height: 40,
        backgroundColor: "#333",
        borderRadius: 20,
        color: "#fff",
        paddingHorizontal: 10,
        fontSize: 14,
    },
    editSection: {
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: "#333",
        color: "#fff",
        padding: 10,
        borderRadius: 5,
    },
    drawer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#101114",
        paddingBottom: 50,
        paddingHorizontal: 16,
        paddingTop: 10,
        maxHeight: height - 80, // Prevent it from taking full height
    },
    commentsList: {
        marginTop: 10,
    },
    comment: {
        marginTop: 10,
        padding: 5,
        backgroundColor: "#333",
        borderRadius: 10,
    },
    commentUsername: {
        fontWeight: "bold",
        color: "#ffffff",
    },
    commentContent: {
        color: "#ffffff",
    },
});

export default Post;
