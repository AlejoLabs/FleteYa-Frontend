import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme";
import AppText from "./AppText";

interface Props {
    steps: string[];
    // Índice del último paso cumplido; -1 si ninguno
    current: number;
    showLabels?: boolean;
}

// Barra por tramos: estados del viaje o pasos de un registro ("2 de 4")
export default function ProgressSteps({ steps, current, showLabels = true }: Props) {
    return (
        <View
            style={styles.row}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: steps.length, now: current + 1, text: steps[current] ?? '' }}
        >
            {steps.map((step, index) => {
                const done = index <= current;
                return (
                    <View key={step} style={styles.step}>
                        <View style={[styles.bar, done && styles.barDone]} />
                        {showLabels &&
                            <AppText variant="caption" color={done ? 'text' : 'textMuted'} align="center" numberOfLines={2}>{step}</AppText>}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    step: {
        flex: 1,
        gap: spacing.xs,
    },
    bar: {
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.surfaceMuted,
    },
    barDone: {
        backgroundColor: colors.successBright,
    },
});
