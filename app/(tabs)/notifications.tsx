import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
            <Text style={{ color: "#ffffff" }}>Notifications Page</Text>
        </View>
    );
}
