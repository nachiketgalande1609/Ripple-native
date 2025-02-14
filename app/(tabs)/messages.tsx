import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Messages() {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
            <Text style={{ color: "#ffffff", fontSize: 22, marginBottom: 20 }}>Profile Page</Text>
        </SafeAreaView>
    );
}
