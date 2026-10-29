import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    unread: number;
    onChat: () => void;
    onReport: () => void;
}

// Chat con la otra persona (con los mensajes sin leer) y reporte de un problema, en las pantallas del viaje
export default function TripActions({ unread, onChat, onReport }: Props) {
    return (
        <View style={styles.row}>
            <TouchableOpacity style={[styles.button, styles.chat]} onPress={onChat} accessibilityLabel="Abrir el chat del viaje">
                <Ionicons name="chatbubbles" size={18} color="white" />
                <Text style={styles.chatText}>Chat</Text>
                {unread > 0 &&
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                    </View>
                }
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.report]} onPress={onReport}>
                <Ionicons name="warning" size={18} color="#b45309" />
                <Text style={styles.reportText}>Reportar problema</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 10,
        marginHorizontal: 10,
        marginTop: 10,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 44,
        borderRadius: 22,
    },
    chat: {
        backgroundColor: '#1f7a3d',
    },
    chatText: {
        color: 'white',
        fontWeight: 'bold',
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        paddingHorizontal: 5,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    report: {
        borderWidth: 1,
        borderColor: '#f59e0b',
        backgroundColor: '#fff7e6',
    },
    reportText: {
        color: '#b45309',
        fontWeight: 'bold',
    },
});
