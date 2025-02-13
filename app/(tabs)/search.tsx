import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import { Avatar, Text, IconButton } from "react-native-paper";
import { useDebounce } from "../../hooks/useDebounce";
import { getSearchResults, getSearchHistory, addToSearchHistory, deleteSearchHistoryItem } from "../../services/api";
import { useRouter } from "expo-router";
import useAuthStore from "../../store/authStore"; // Import store

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(searchQuery, 300);
    const router = useRouter();

    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await getSearchHistory(currentUser?.id);
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to load history:", error);
            }
        };
        loadHistory();
    }, []);

    useEffect(() => {
        const search = async () => {
            if (!debouncedQuery) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const response = await getSearchResults(debouncedQuery);
                setResults(response.data.users);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };
        search();
    }, [debouncedQuery]);

    const handleUserClick = async (targetUser: any) => {
        try {
            await addToSearchHistory(currentUser?.id, targetUser.id);
            const historyResponse = await getSearchHistory(currentUser?.id);
            setHistory(historyResponse.data.data);
            router.replace("../(tabs)/profile");
        } catch (error) {
            console.error("Error saving history:", error);
        }
    };

    const handleDeleteHistory = async (historyId: number) => {
        try {
            await deleteSearchHistoryItem(currentUser?.id, historyId);
            setHistory((prev) => prev.filter((item) => item.history_id !== historyId));
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "#000000" }}>
            <TextInput
                style={{
                    height: 40,
                    backgroundColor: "#1e1e1e",
                    color: "white",
                    borderRadius: 20,
                    paddingHorizontal: 15,
                    marginBottom: 10,
                }}
                placeholder="Search Users"
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {loading && <ActivityIndicator size="large" color="#ffffff" />}
            <FlatList
                data={results.length > 0 ? results : history}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 10 }} onPress={() => handleUserClick(item)}>
                        <Avatar.Image source={{ uri: item.profile_picture }} size={40} />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={{ color: "white" }}>{item.username}</Text>
                            <Text style={{ color: "gray" }}>{item.email}</Text>
                        </View>
                        {history.includes(item) && <IconButton icon="close" onPress={() => handleDeleteHistory(item.history_id)} />}
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
