import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import AppText from "./AppText";

// Contador de no leídos sobre un botón o un ícono
export function CountBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <View style={styles.count} accessibilityLabel={`${count} sin leer`}>
            <AppText variant="caption" color="asphalt">{count > 9 ? '9+' : count}</AppText>
        </View>
    );
}

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'cargo';

const TONES: Record<StatusTone, { background: string; text: string }> = {
    success: { background: colors.successTint, text: colors.success },
    warning: { background: colors.warningTint, text: colors.warning },
    danger: { background: colors.dangerTint, text: colors.danger },
    neutral: { background: colors.surfaceMuted, text: colors.textMuted },
    cargo: { background: colors.cargo, text: colors.asphalt },
};

// Estado corto: "Disponible", "Vence pronto", "En revisión", "Programado"
export function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
    const palette = TONES[tone];
    return (
        <View style={[styles.pill, { backgroundColor: palette.background }]}>
            <AppText variant="caption" style={{ color: palette.text }}>{label}</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    count: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cargo,
    },
    pill: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs + 1,
        borderRadius: radius.pill,
    },
});
