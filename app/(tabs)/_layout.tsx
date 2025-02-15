import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { View, Text, Dimensions } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { LilyScriptOne_400Regular } from "@expo-google-fonts/lily-script-one";
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from "react-native-svg";
import useAuthStore from "../../store/authStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import useNotificationMessagesStore from "@/store/unreadNotificationAndMessagesStore";

const screenWidth = Dimensions.get("window").width;

type TabIconProps = {
    name: "home" | "search" | "chatbubble" | "notifications" | "person";
    focused: boolean;
    color: string;
    size: number;
    badgeCount?: number;
};

export default function TabLayout() {
    const currentUser = useAuthStore((state) => state.user);
    const router = useRouter();
    const { userId } = useLocalSearchParams();

    const { unreadMessagesCount, unreadNotificationsCount, resetUnreadNotifications } = useNotificationMessagesStore();

    const [fontsLoaded] = useFonts({
        LilyScriptOne: LilyScriptOne_400Regular,
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }} onLayout={onLayoutRootView}>
            <StatusBar style="light" backgroundColor="#000000" />
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    headerTitle: () => (
                        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                            <Svg height="45" width="120">
                                <Defs>
                                    <SvgGradient id="gradientText" x1="0" y1="0" x2="1" y2="0">
                                        <Stop offset="0" stopColor="#7a60ff" />
                                        <Stop offset="1" stopColor="#ff8800" />
                                    </SvgGradient>
                                </Defs>
                                <SvgText x="0" y="30" fontSize="32" fontFamily="LilyScriptOne" fill="url(#gradientText)">
                                    Ripple
                                </SvgText>
                            </Svg>
                        </View>
                    ),
                    headerStyle: { backgroundColor: "#000000" },
                    headerTitleAlign: "left",
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
                        tabBarIcon: ({ color, focused, size }) => <TabIcon name="home" focused={focused} color={color} size={size} />,
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: "Search",
                        tabBarIcon: ({ color, focused, size }) => <TabIcon name="search" focused={focused} color={color} size={size} />,
                    }}
                />
                <Tabs.Screen
                    name="messages"
                    options={{
                        title: "Messages",
                        tabBarIcon: ({ color, focused, size }) => (
                            <TabIcon name="chatbubble" focused={focused} color={color} size={size} badgeCount={unreadMessagesCount} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="notifications"
                    options={{
                        title: "Notifications",
                        tabBarIcon: ({ color, focused, size }) => (
                            <TabIcon name="notifications" focused={focused} color={color} size={size} badgeCount={unreadNotificationsCount} />
                        ),
                    }}
                    listeners={{
                        tabPress: () => resetUnreadNotifications(),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ color, focused, size }) => <TabIcon name="person" focused={focused} color={color} size={size} />,
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault(); // Prevent default tab navigation
                            if (currentUser?.id) {
                                router.push(`/profile?userId=${currentUser.id}`); // Navigate with userId as query param
                            }
                        },
                    }}
                />
            </Tabs>
        </View>
    );
}

const TabIcon = ({ name, focused, color, size, badgeCount = 0 }: TabIconProps) => {
    return (
        <View
            style={{
                width: screenWidth * 0.2,
                height: 45,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 5,
                position: "relative",
                borderTopWidth: focused ? 2 : 0,
                borderTopColor: "#ffffff",
            }}
        >
            <Ionicons name={focused ? name : `${name}-outline`} size={size} color="#ffffff" />
            {badgeCount > 0 && (
                <View
                    style={{
                        position: "absolute",
                        top: 3,
                        right: 20,
                        backgroundColor: "red",
                        borderRadius: 12,
                        minWidth: 18,
                        height: 18,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 4,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>{badgeCount > 99 ? "99+" : badgeCount}</Text>
                </View>
            )}
        </View>
    );
};
