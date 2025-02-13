import api from "./config";
import { LOGIN_ENDPOINT, REGISTER_ENDPOINT, POSTS_ENDPOINT, GET_PROFILE_ENDPOINT } from "./apiEndpoints";

interface UserRegisterData {
    email: string;
    username: string;
    password: string;
}

interface UserLoginData {
    email: string;
    password: string;
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
