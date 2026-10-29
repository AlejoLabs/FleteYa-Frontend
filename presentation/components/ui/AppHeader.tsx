import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, touchTarget } from "../../theme";
import AppText from "./AppText";

interface Props {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    // Acción a la derecha: "2 de 4", un botón de icono, un estado
    right?: React.ReactNode;
    tone?: 'light' | 'dark';
}

// Encabezado de pantalla dentro del contenido (no como header del stack), para que el teclado no lo tape.
// Va debajo de la barra del menú lateral, que ya cubre la barra de estado
export default function AppHeader({ title, subtitle, onBack, right, tone = 'light' }: Props) {
    const dark = tone === 'dark';
    const color = dark ? colors.textOnDark : colors.text;
    return (
        <View style={[styles.container, { backgroundColor: dark ? colors.asphalt : colors.surface }, !dark && styles.divider]}>
            {onBack &&
                <Pressable onPress={onBack} hitSlop={8} style={styles.back} accessibilityRole="button" accessibilityLabel="Volver">
                    <Ionicons name="arrow-back" size={24} color={color} />
                </Pressable>
            }
            <View style={styles.titles}>
                <AppText variant="heading" style={{ color }} numberOfLines={1} accessibilityRole="header">{title}</AppText>
                {subtitle && <AppText variant="caption" style={{ color: dark ? colors.textOnDarkMuted : colors.textMuted }} numberOfLines={1}>{subtitle}</AppText>}
            </View>
            {right && <View style={styles.right}>{right}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: touchTarget + 8,
        paddingHorizontal: spacing.sm,
        paddingRight: spacing.lg,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    back: {
        width: touchTarget,
        height: touchTarget,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titles: {
        flex: 1,
        paddingLeft: spacing.sm,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
});
