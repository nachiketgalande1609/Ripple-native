import api from "./config";
import {
    LOGIN_ENDPOINT,
    REGISTER_ENDPOINT,
    POSTS_ENDPOINT,
    GET_PROFILE_ENDPOINT,
    SHARE_MEDIA_ENDPOINT,
    GET_ALL_MESSAGES_ENDPOINT,
    SETTINGS_ENDPOINT,
    GET_NOTIFICATIONS_COUNT,
    GET_NOTIFICATIONS_ENDPOINT,
    CHAT_USER_DETAILS_ENDPOINT,
    SEARCH_HISTORY_ENDPOINT,
    SEARCH_ENDPOINT,
    FOLLOW_RESPONSE_ENDPOINT,
    UPDATE_PROFILE_ENDPOINT,
    FOLLOW_ENDPOINT,
    ADD_POST_COMMENT_ENDPOINT,
    LIKE_POST_ENDPOINT,
    UPDATE_POST_ENDPOINT,
    UPLOAD_PROFILE_PICTURE_ENDPOINT,
} from "./apiEndpoints";

interface UserRegisterData {
    email: string;
    username: string;
    password: string;
}

interface UserLoginData {
    email: string;
    password: string;
}

interface PostData {
    user_id: string;
    content: string;
    image?: File;
    location: string;
}

interface ProfileData {
    username?: string;
    profile_picture_url?: string;
    bio?: string;
}

export const registerUser = async (userData: UserRegisterData) => {
    try {
        const response = await api.post(REGISTER_ENDPOINT, userData);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Registration failed:", error.message);
        } else {
            console.error("Registration failed: Unknown error");
        }
        throw error;
    }
};

export const loginUser = async (userData: UserLoginData) => {
    try {
        const response = await api.post(LOGIN_ENDPOINT, userData);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Login failed:", error.message);
        } else {
            console.error("Login failed: Unknown error");
        }
        throw error;
    }
};

export const getPosts = async (userId: number) => {
    try {
        const response = await api.get(POSTS_ENDPOINT, {
            params: { userId },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};

export const getProfile = async (userId: number, currentUserId: number) => {
    try {
        const response = await api.get(`${GET_PROFILE_ENDPOINT}/${userId}?currentUserId=${currentUserId}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const getUserPosts = async (currentUserId: number, userId: number) => {
    try {
        const response = await api.post(`${POSTS_ENDPOINT}/${userId}`, { currentUserId });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const createPost = async (postData: PostData) => {
    try {
        const formData = new FormData();
        formData.append("user_id", postData.user_id);
        formData.append("content", postData.content);
        formData.append("location", postData.location);

        if (postData.image) {
            formData.append("image", postData.image);
        }

        const response = await api.post(POSTS_ENDPOINT, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error occurred");
        }
        throw error;
    }
};

export const uploadProfilePicture = async (userId: string, profilePic: File) => {
    try {
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("profile_pic", profilePic);

        const response = await api.post(UPLOAD_PROFILE_PICTURE_ENDPOINT, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error occurred");
        }
        throw error;
    }
};

export const updatePost = async (postId: string, editContent: string) => {
    try {
        const response = await api.post(`${UPDATE_POST_ENDPOINT}/${postId}`, { content: editContent });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("unknown Error");
        }
        throw error;
    }
};

export const deletePost = async (userId: string, postId: string) => {
    try {
        const response = await api.delete(`${POSTS_ENDPOINT}?userId=${userId}&postId=${postId}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const likePost = async (userId: string, postId: string) => {
    try {
        const response = await api.post(LIKE_POST_ENDPOINT, { userId, postId });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error liking the post:", error.message);
        } else {
            console.error("Unknown error while liking the post");
        }
        throw error; // Re-throws the error to be handled by the caller
    }
};

export const addComment = async (userId: string, postId: string, comment: string) => {
    try {
        const response = await api.post(ADD_POST_COMMENT_ENDPOINT, { userId, postId, comment });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error adding the comment:", error.message);
        } else {
            console.error("Unknown error while adding the comment");
        }
        throw error; // Re-throws the error to be handled by the caller
    }
};

export const followUser = async (followerId: string, followingId: string) => {
    try {
        const response = await api.post(FOLLOW_ENDPOINT, { followerId, followingId });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to send follow request:", error.message);
        } else {
            console.error("Failed to send follow request: Unknown error");
        }
        throw error;
    }
};

export const updateProfileDetails = async (userId: string, updatedProfile: ProfileData) => {
    try {
        const response = await api.put(UPDATE_PROFILE_ENDPOINT, { userId, updatedProfile });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to update profile:", error.message);
        } else {
            console.error("Failed to update profile: Unknown error");
        }
        throw error;
    }
};

export const respondToFollowRequest = async (requestId: number, status: string) => {
    try {
        const res = await api.post(FOLLOW_RESPONSE_ENDPOINT, { requestId, status });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to send follow request:", error.message);
        } else {
            console.error("Failed to send follow request: Unknown error");
        }
        throw error;
    }
};

export const getSearchResults = async (searchQuery: string) => {
    try {
        const response = await api.get(`${SEARCH_ENDPOINT}?searchString=${searchQuery}`);

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const getSearchHistory = async (userId: number) => {
    try {
        const response = await api.get(`${SEARCH_HISTORY_ENDPOINT}?userId=${userId}`);

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const addToSearchHistory = async (currentUserId: number, targetUserId: number) => {
    try {
        const response = await api.post(SEARCH_HISTORY_ENDPOINT, { userId: currentUserId, target_user_id: targetUserId });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const deleteSearchHistoryItem = async (currentUserId: number, historyId: number) => {
    try {
        const response = await api.delete(SEARCH_HISTORY_ENDPOINT, {
            params: { userId: currentUserId, historyId: historyId },
        });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const getUserMessageDetails = async (userId: string) => {
    try {
        const response = await api.get(`${CHAT_USER_DETAILS_ENDPOINT}/${userId}`);

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const getNotifications = async (userId: string) => {
    try {
        const response = await api.get(`${GET_NOTIFICATIONS_ENDPOINT}/${userId}`);

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const getNotificationsCount = async (userId: string) => {
    try {
        const response = await api.get(`${GET_NOTIFICATIONS_COUNT}/${userId}`);

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const updatePrivacy = async (userId: number, isPrivate: boolean) => {
    try {
        const response = await api.patch(`${SETTINGS_ENDPOINT}/privacy`, { userId, isPrivate });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("unknown Error");
        }
        throw error;
    }
};

export const getAllMessagesData = async (userId: string) => {
    try {
        const response = await api.get(`${GET_ALL_MESSAGES_ENDPOINT}/${userId}`);

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown Error");
        }
        throw error;
    }
};

export const shareChatMedia = async (mediaMessageData: FormData): Promise<any> => {
    try {
        const response = await api.post(SHARE_MEDIA_ENDPOINT, mediaMessageData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error occurred");
        }
        throw error;
    }
};
