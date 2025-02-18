import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { saveToken } from "../../utils/auth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { loginUser } from "@/services/api";
import useAuthStore from "../../store/authStore"; // Import store

export default function Login() {
    const { setUser } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email, password });

            if (response.success) {
                const { token, user } = response.data;
                await saveToken(token);
                setUser(user);
                router.replace("../(tabs)/");
            } else {
                Alert.alert("Login Failed", response.error);
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
            <StatusBar style="light" backgroundColor="#000000" />
            <Text style={{ color: "white", fontSize: 22, marginBottom: 20 }}>Login</Text>
            <TextInput
                style={{ backgroundColor: "#222", color: "white", padding: 10, width: "80%", marginBottom: 10, borderRadius: 8 }}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={{ backgroundColor: "#222", color: "white", padding: 10, width: "80%", marginBottom: 10, borderRadius: 8 }}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: "#7a60ff", padding: 10, borderRadius: 8, width: "80%", marginTop: 10 }}>
                <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>Login</Text>
            </TouchableOpacity>
            {/* Register Link */}
            <TouchableOpacity onPress={() => router.push("/auth/register")} style={{ marginTop: 15 }}>
                <Text style={{ color: "#7a60ff", fontSize: 16, textAlign: "center" }}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}
