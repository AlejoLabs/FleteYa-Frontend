import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, touchTarget } from "../../theme";
import AppText from "./AppText";

export type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'success' | 'danger' | 'dangerText' | 'text' | 'google' | 'onDark';

interface Props {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: 'md' | 'sm';
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
}

const VARIANTS: Record<ButtonVariant, { background: string; pressed: string; text: string; border?: string }> = {
    primary: { background: colors.cargo, pressed: colors.cargoPressed, text: colors.asphalt },
    dark: { background: colors.asphalt, pressed: colors.asphaltRaised, text: colors.textOnDark },
    secondary: { background: colors.surfaceMuted, pressed: colors.border, text: colors.text },
    success: { background: colors.success, pressed: colors.successPressed, text: colors.textOnDark },
    danger: { background: colors.dangerTint, pressed: colors.dangerTintPressed, text: colors.danger },
    dangerText: { background: 'transparent', pressed: colors.dangerTint, text: colors.danger },
    text: { background: 'transparent', pressed: colors.surfaceMuted, text: colors.text },
    google: { background: colors.google, pressed: colors.surfaceMuted, text: colors.text, border: colors.borderStrong },
    onDark: { background: colors.fieldOnDark, pressed: colors.fieldOnDarkPressed, text: colors.textOnDark },
};

// Botón del sistema de diseño. primary (amarillo) es la acción principal de la pantalla; solo debe haber uno
export default function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading = false, disabled = false, style, accessibilityLabel }: Props) {
    const palette = VARIANTS[variant];
    const inactive = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityState={{ disabled: inactive, busy: loading }}
            style={({ pressed }) => [
                styles.base,
                size === 'sm' && styles.small,
                { backgroundColor: pressed ? palette.pressed : palette.background },
                palette.border && { borderWidth: 1, borderColor: palette.border },
                disabled && styles.inactive,
                style,
            ]}
        >
            {loading
                ? <ActivityIndicator color={palette.text} />
                : <View style={styles.content}>
                    {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={palette.text} />}
                    <AppText variant={size === 'sm' ? 'smallStrong' : 'button'} style={{ color: palette.text }} numberOfLines={1}>
                        {title}
                    </AppText>
                </View>
            }
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: touchTarget + 4,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    small: {
        minHeight: touchTarget - 8,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    inactive: {
        opacity: 0.45,
    },
});
