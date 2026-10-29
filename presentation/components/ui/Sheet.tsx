import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing } from "../../theme";

interface Props {
    children: React.ReactNode;
    // scroll: el contenido puede ser más alto que la hoja (formulario de la solicitud)
    scroll?: boolean;
    maxHeight?: number | `${number}%`;
    // Botones fijos abajo, siempre visibles aunque el contenido se desplace
    footer?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

// Hoja inferior sobre el mapa: esquinas redondeadas arriba, agarradera y respeto de la barra de gestos
export default function Sheet({ children, scroll = false, maxHeight, footer, style }: Props) {
    const insets = useSafeAreaInsets();
    const bottom = { paddingBottom: spacing.lg + insets.bottom };

    return (
        <View style={[styles.sheet, maxHeight !== undefined && { maxHeight }, style]}>
            <View style={styles.grab} />
            {scroll
                ? <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, !footer && bottom]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
                : <View style={[styles.content, !footer && bottom]}>{children}</View>}
            {footer && <View style={[styles.footer, bottom]}>{footer}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        ...shadows.sheet,
    },
    grab: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.borderStrong,
        marginTop: spacing.sm,
    },
    scroll: {
        flexGrow: 0,
        flexShrink: 1,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        gap: spacing.md,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
    },
});
