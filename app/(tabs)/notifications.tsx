import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { removeToken } from "../../utils/auth";
import { useRouter } from "expo-router";

export default function Notifications() {
    const router = useRouter();

    const handleLogout = async () => {
        await removeToken();
        router.replace("/auth/login");
    };

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
            <Text style={{ color: "#ffffff", fontSize: 22, marginBottom: 20 }}>Profile Page</Text>

            <TouchableOpacity
                onPress={handleLogout}
                style={{
                    backgroundColor: "#ff4444",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    marginTop: 20,
                }}
            >
                <Text style={{ color: "#ffffff", fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
