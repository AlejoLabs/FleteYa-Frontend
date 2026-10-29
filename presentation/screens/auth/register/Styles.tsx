import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flex: {
        flex: 1,
    },
    content: {
        gap: spacing.lg,
        padding: spacing.lg,
    },
    options: {
        gap: spacing.sm,
        marginTop: -spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    // Las acciones quedan abajo y visibles aunque el formulario se desplace
    footer: {
        gap: spacing.sm,
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
});

export default styles;
