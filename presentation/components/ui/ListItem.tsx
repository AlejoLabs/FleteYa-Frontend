import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, touchTarget } from "../../theme";
import AppText from "./AppText";

interface Props {
    title: string;
    subtitle?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    // Algo a la derecha: un contador, un estado, un valor
    right?: React.ReactNode;
    tone?: 'default' | 'danger';
    showChevron?: boolean;
}

// Fila de menú o de ajustes: menú lateral, perfil, documentos del vehículo
export default function ListItem({ title, subtitle, icon, onPress, right, tone = 'default', showChevron = !!onPress }: Props) {
    const color = tone === 'danger' ? colors.danger : colors.text;
    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole={onPress ? 'button' : undefined}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
            {icon &&
                <View style={[styles.icon, tone === 'danger' && { backgroundColor: colors.dangerTint }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
            }
            <View style={styles.texts}>
                <AppText variant="bodyStrong" style={{ color }}>{title}</AppText>
                {subtitle && <AppText variant="small" color="textMuted">{subtitle}</AppText>}
            </View>
            {right}
            {showChevron && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget + 8,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.md,
    },
    pressed: {
        backgroundColor: colors.surfaceMuted,
    },
    icon: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceMuted,
    },
    texts: {
        flex: 1,
        gap: spacing.xxs,
    },
});
