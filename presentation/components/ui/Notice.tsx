import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme";
import AppText from "./AppText";

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger' | 'cargo';

interface Props {
    tone?: NoticeTone;
    title?: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

const TONES: Record<NoticeTone, { background: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
    info: { background: colors.infoTint, text: colors.info, icon: 'information-circle' },
    success: { background: colors.successTint, text: colors.success, icon: 'checkmark-circle' },
    warning: { background: colors.warningTint, text: colors.warning, icon: 'alert-circle' },
    danger: { background: colors.dangerTint, text: colors.danger, icon: 'close-circle' },
    cargo: { background: colors.cargoTint, text: colors.text, icon: 'bulb' },
};

// Aviso dentro de la pantalla: documentos por vencer, vehículo sugerido, chat de solo lectura
export default function Notice({ tone = 'info', title, message, actionLabel, onAction }: Props) {
    const palette = TONES[tone];
    return (
        <View style={[styles.container, { backgroundColor: palette.background }]} accessibilityRole="alert">
            <Ionicons name={palette.icon} size={20} color={palette.text} style={styles.icon} />
            <View style={styles.body}>
                {title && <AppText variant="smallStrong" style={{ color: palette.text }}>{title}</AppText>}
                <AppText variant="small" style={{ color: tone === 'cargo' ? colors.text : palette.text }}>{message}</AppText>
                {actionLabel && onAction &&
                    <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
                        <AppText variant="smallStrong" style={[styles.action, { color: palette.text }]}>{actionLabel}</AppText>
                    </Pressable>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
    },
    icon: {
        marginTop: 1,
    },
    body: {
        flex: 1,
        gap: spacing.xxs,
    },
    action: {
        textDecorationLine: 'underline',
        marginTop: spacing.xs,
    },
});
