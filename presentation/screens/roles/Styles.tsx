import { StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
    },
    intro: {
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconPlate: {
        width: 52,
        height: 52,
        borderRadius: radius.md,
        backgroundColor: colors.cargoTint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texts: {
        flex: 1,
        gap: spacing.xxs,
    },
});

export default styles;
