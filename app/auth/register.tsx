import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Register() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !username || !password || !confirmPassword) {
            Alert.alert("Error", "All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        try {
            const response = await axios.post("http://192.168.1.2:5000/api/auth/register", {
                email,
                username,
                password,
            });

            if (response.data.success) {
                Alert.alert("Success", "Registration successful! You can now log in.");
                router.replace("/auth/login"); // Navigate to login page after successful registration
            } else {
                Alert.alert("Registration Failed", response.data.error);
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
            <StatusBar style="light" backgroundColor="#000000" />
            <Text style={{ color: "white", fontSize: 22, marginBottom: 20 }}>Register</Text>
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
                placeholder="Username"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={{ backgroundColor: "#222", color: "white", padding: 10, width: "80%", marginBottom: 10, borderRadius: 8 }}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={{ backgroundColor: "#222", color: "white", padding: 10, width: "80%", marginBottom: 10, borderRadius: 8 }}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
                onPress={handleRegister}
                style={{ backgroundColor: "#7a60ff", padding: 10, borderRadius: 8, width: "80%", marginTop: 10 }}
            >
                <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/auth/login")} style={{ marginTop: 15 }}>
                <Text style={{ color: "#7a60ff", fontSize: 16, textAlign: "center" }}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}
