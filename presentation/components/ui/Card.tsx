import { Pressable, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "../../theme";

interface Props extends ViewProps {
    // outlined: lista de ofertas o solicitudes; elevated: algo que flota sobre el mapa; muted: bloque informativo
    variant?: 'outlined' | 'elevated' | 'muted';
    selected?: boolean;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export default function Card({ variant = 'outlined', selected = false, onPress, style, children, ...props }: Props) {
    const cardStyle = [styles.base, styles[variant], selected && styles.selected, style];
    if (!onPress) return <View style={cardStyle} {...props}>{children}</View>;
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
            {...props}
        >
            {children}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.surface,
    },
    outlined: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    elevated: {
        ...shadows.card,
    },
    muted: {
        backgroundColor: colors.surfaceMuted,
    },
    selected: {
        borderWidth: 2,
        borderColor: colors.asphalt,
    },
    pressed: {
        opacity: 0.85,
    },
});
