import { StyleSheet, View } from "react-native";
import { Button, CountBadge } from "./ui";
import { spacing } from "../theme";
import { useTranslation } from 'react-i18next';

interface Props {
    unread: number;
    onChat: () => void;
    onReport: () => void;
}

// Chat con la otra persona (con los mensajes sin leer) y reporte de un problema, en las pantallas del viaje
export default function TripActions({ unread, onChat, onReport }: Props) {
    const { t } = useTranslation();
    return (
        <View style={styles.row}>
            <View style={styles.item}>
                <Button
                    title={t('tripActions.chat')}
                    icon="chatbubble-outline"
                    variant="dark"
                    onPress={onChat}
                    accessibilityLabel={unread > 0 ? t('tripActions.abrirElChatSinLeer', { count: unread }) : t('tripActions.abrirElChatDelViaje')}
                />
                {/* Encima del botón y no dentro: el botón solo lleva texto e icono */}
                <View style={styles.badge} pointerEvents="none">
                    <CountBadge count={unread} />
                </View>
            </View>
            <View style={styles.item}>
                <Button title={t('tripActions.reportar')} icon="warning-outline" variant="secondary" onPress={onReport} accessibilityLabel={t('common.reportarUnProblema')} />
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
