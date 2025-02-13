import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { View, Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;

export default function TabLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <StatusBar style="light" backgroundColor="#000000" />
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        backgroundColor: "#000000",
                        height: 61,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        borderTopWidth: 0,
                        borderWidth: 0,
                        shadowColor: "transparent",
                        shadowOpacity: 0,
                        elevation: 0,
                    },
                    tabBarItemStyle: { justifyContent: "center", alignItems: "center" },
                    tabBarActiveTintColor: "#000000",
                    tabBarInactiveTintColor: "#888888",
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color, focused, size }) => (
                            <View
                                style={{
                                    backgroundColor: focused ? "#ffffff" : "transparent",
                                    width: screenWidth * 0.2,
                                    height: 45,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: 5,
                                }}
                            >
                                <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="pages/search"
                    options={{
                        title: "Search",
                        tabBarIcon: ({ color, focused, size }) => (
                            <View
                                style={{
                                    backgroundColor: focused ? "#ffffff" : "transparent",
                                    width: screenWidth * 0.2,
                                    height: 45,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: 5,
                                }}
                            >
                                <Ionicons name={focused ? "search" : "search-outline"} size={size} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="pages/messages"
                    options={{
                        title: "Messages",
                        tabBarIcon: ({ color, focused, size }) => (
                            <View
                                style={{
                                    backgroundColor: focused ? "#ffffff" : "transparent",
                                    width: screenWidth * 0.2,
                                    height: 45,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: 5,
                                }}
                            >
                                <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={size} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="pages/notifications"
                    options={{
                        title: "Notifications",
                        tabBarIcon: ({ color, focused, size }) => (
                            <View
                                style={{
                                    backgroundColor: focused ? "#ffffff" : "transparent",
                                    width: screenWidth * 0.2,
                                    height: 45,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: 5,
                                }}
                            >
                                <Ionicons name={focused ? "notifications" : "notifications-outline"} size={size} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="pages/profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ color, focused, size }) => (
                            <View
                                style={{
                                    backgroundColor: focused ? "#ffffff" : "transparent",
                                    width: screenWidth * 0.2,
                                    height: 45,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: 5,
                                }}
                            >
                                <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
                            </View>
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}
