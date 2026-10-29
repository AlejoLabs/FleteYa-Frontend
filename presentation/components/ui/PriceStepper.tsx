import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, touchTarget } from "../../theme";
import { Amount } from "./Money";

interface Props {
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    // Tocar el precio abre la edición a mano (la pantalla decide cómo)
    onPressValue?: () => void;
}

// Precio con − y +, como al ofrecer o subir el precio del flete
export default function PriceStepper({ value, onChange, step = 1000, min = 0, max = Number.MAX_SAFE_INTEGER, onPressValue }: Props) {
    const canDecrease = value - step >= min;
    const canIncrease = value + step <= max;

    return (
        <View style={styles.container} accessibilityRole="adjustable" accessibilityValue={{ text: `${value} pesos` }}>
            <StepButton icon="remove" label={`Bajar ${step} pesos`} disabled={!canDecrease} onPress={() => onChange(value - step)} />
            <Pressable onPress={onPressValue} disabled={!onPressValue} style={styles.value} accessibilityLabel="Escribir el precio">
                <Amount value={value} size="lg" />
            </Pressable>
            <StepButton icon="add" label={`Subir ${step} pesos`} disabled={!canIncrease} onPress={() => onChange(value + step)} />
        </View>
    );
}

function StepButton({ icon, label, disabled, onPress }: { icon: 'add' | 'remove'; label: string; disabled: boolean; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.step, pressed && styles.stepPressed, disabled && styles.stepDisabled]}
        >
            <Ionicons name={icon} size={24} color={colors.asphalt} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xs,
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceMuted,
    },
    value: {
        flex: 1,
        alignItems: 'center',
    },
    step: {
        width: touchTarget + 4,
        height: touchTarget + 4,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    stepPressed: {
        backgroundColor: colors.border,
    },
    stepDisabled: {
        opacity: 0.4,
    },
});
