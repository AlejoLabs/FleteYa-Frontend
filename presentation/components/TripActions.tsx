import { StyleSheet, View } from "react-native";
import { Button, CountBadge } from "./ui";
import { spacing } from "../theme";

interface Props {
    unread: number;
    onChat: () => void;
    onReport: () => void;
}

// Chat con la otra persona (con los mensajes sin leer) y reporte de un problema, en las pantallas del viaje
export default function TripActions({ unread, onChat, onReport }: Props) {
    return (
        <View style={styles.row}>
            <View style={styles.item}>
                <Button
                    title="Chat"
                    icon="chatbubble-outline"
                    variant="dark"
                    onPress={onChat}
                    accessibilityLabel={unread > 0 ? `Abrir el chat, ${unread} ${unread === 1 ? 'mensaje' : 'mensajes'} sin leer` : 'Abrir el chat del viaje'}
                />
                {/* Encima del botón y no dentro: el botón solo lleva texto e icono */}
                <View style={styles.badge} pointerEvents="none">
                    <CountBadge count={unread} />
                </View>
            </View>
            <View style={styles.item}>
                <Button title="Reportar" icon="warning-outline" variant="secondary" onPress={onReport} accessibilityLabel="Reportar un problema" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    item: {
        flex: 1,
    },
    badge: {
        position: 'absolute',
        top: spacing.xs,
        right: spacing.sm,
    },
});
