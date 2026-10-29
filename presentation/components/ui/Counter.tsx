import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, touchTarget } from "../../theme";
import AppText from "./AppText";

interface Props {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    hint?: string;
}

// Fila con un número que se sube o baja: artículos, ayudantes, piso
export default function Counter({ label, value, onChange, min = 0, max = 99, hint }: Props) {
    return (
        <View style={styles.row}>
            <View style={styles.texts}>
                <AppText variant="body">{label}</AppText>
                {hint && <AppText variant="caption" color="textMuted">{hint}</AppText>}
            </View>
            <View style={styles.controls} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min, max, now: value }}>
                <CounterButton icon="remove" label={`Menos ${label.toLowerCase()}`} disabled={value <= min} onPress={() => onChange(value - 1)} />
                <AppText variant="heading" align="center" style={styles.value}>{value}</AppText>
                <CounterButton icon="add" label={`Más ${label.toLowerCase()}`} disabled={value >= max} onPress={() => onChange(value + 1)} />
            </View>
        </View>
    );
}

function CounterButton({ icon, label, disabled, onPress }: { icon: 'add' | 'remove'; label: string; disabled: boolean; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
        >
            <Ionicons name={icon} size={20} color={colors.asphalt} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget,
    },
    texts: {
        flex: 1,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceMuted,
    },
    pressed: {
        backgroundColor: colors.border,
    },
    disabled: {
        opacity: 0.4,
    },
    value: {
        minWidth: 36,
    },
});
