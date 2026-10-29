import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../../../../components/ui";
import { colors, radius, spacing, touchTarget } from "../../../../theme";

interface Props {
    value: boolean;
    onChange: (value: boolean) => void;
}

// Interruptor grande del encabezado oscuro: verde con el círculo a la derecha cuando el conductor recibe fletes
export default function AvailabilitySwitch({ value, onChange }: Props) {
    return (
        <Pressable
            onPress={() => onChange(!value)}
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            accessibilityLabel="Disponible para recibir fletes"
            style={({ pressed }) => [styles.pill, value ? styles.on : styles.off, pressed && styles.pressed]}
        >
            {!value && <View style={styles.knob} />}
            <AppText variant="bodyStrong" color="textOnDark">{value ? 'Disponible' : 'No disponible'}</AppText>
            {value && <View style={styles.knob} />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: touchTarget,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.pill,
    },
    on: {
        paddingLeft: spacing.md + 2,
        backgroundColor: colors.success,
    },
    off: {
        paddingRight: spacing.md + 2,
        backgroundColor: colors.asphaltRaised,
    },
    pressed: {
        opacity: 0.85,
    },
    knob: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surface,
    },
});
