import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { removeToken } from "../utils/auth";
import { useRouter } from "expo-router";

interface ProfileModalType {
    menuVisible: boolean;
    setMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProfileModal({ menuVisible, setMenuVisible }: ProfileModalType) {
    const router = useRouter();

    const handleLogout = async () => {
        await removeToken();
        router.replace("/auth/login");
    };

    return (
        <Modal visible={menuVisible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setMenuVisible(false)}>
                            <Text style={styles.modalText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setMenuVisible(false)}>
                            <Text style={styles.modalText}>Copy Profile Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setMenuVisible(false)}>
                            <Text style={styles.modalText}>Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setMenuVisible(false);
                                handleLogout();
                            }}
                        >
                            <Text style={styles.modalText}>Logout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButtonLast} onPress={() => setMenuVisible(false)}>
                            <Text style={styles.modalText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.9)",
    },
    modalContainer: {
        backgroundColor: "#202327",
        borderRadius: 20,
        width: 275,
        alignItems: "center",
    },
    modalButton: {
        padding: 10,
        width: "100%",
        alignItems: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: "#505050",
    },
    modalButtonLast: {
        padding: 10,
        width: "100%",
        alignItems: "center",
    },
    modalText: {
        color: "#90CAF9",
        fontSize: 15,
    },
});
