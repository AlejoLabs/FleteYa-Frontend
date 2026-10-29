import { StyleSheet } from "react-native";
import { colors, spacing, touchTarget } from "../../../theme";

// Sin posiciones fijas: el contenido se centra y se desplaza cuando abre el teclado o la pantalla es pequeña
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.asphalt,
    },
    flex: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'space-between',
        gap: spacing.xl,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
    },
    form: {
        flexGrow: 1,
        justifyContent: 'center',
        gap: spacing.lg,
        width: '100%',
        maxWidth: 440,
        alignSelf: 'center',
    },
    tagline: {
        fontSize: 18,
        lineHeight: 25,
        marginBottom: spacing.sm,
    },
    forgot: {
        alignSelf: 'flex-end',
        minHeight: touchTarget,
        justifyContent: 'center',
        marginVertical: -spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
    },
});

export default styles;
