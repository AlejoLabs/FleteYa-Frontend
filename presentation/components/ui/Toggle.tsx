import { Pressable, StyleSheet, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, touchTarget } from "../../theme";
import AppText from "./AppText";

interface Props {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    hint?: string;
}

// Sí o no que se puede cambiar cuando quiera: "Es frágil", "Hay ascensor"
export function SwitchRow({ label, value, onChange, hint }: Props) {
    return (
        <Pressable onPress={() => onChange(!value)} style={styles.row} accessibilityRole="switch" accessibilityState={{ checked: value }}>
            <View style={styles.texts}>
                <AppText variant="body">{label}</AppText>
                {hint && <AppText variant="caption" color="textMuted">{hint}</AppText>}
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.borderStrong, true: colors.success }}
                thumbColor={colors.surface}
                importantForAccessibility="no"
            />
        </Pressable>
    );
}

interface CheckboxProps extends Props {
    error?: string | null;
}

// Declaración que hay que aceptar antes de seguir ("Confirmo que la carga no es material peligroso")
export function CheckboxRow({ label, value, onChange, hint, error }: CheckboxProps) {
    return (
        <View style={styles.checkContainer}>
            <Pressable
                onPress={() => onChange(!value)}
                style={[styles.checkRow, !!error && styles.checkRowError]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value }}
            >
                <View style={[styles.box, value && styles.boxOn]}>
                    {value && <Ionicons name="checkmark" size={16} color={colors.textOnDark} />}
                </View>
                <View style={styles.texts}>
                    <AppText variant="small">{label}</AppText>
                    {hint && <AppText variant="caption" color="textMuted">{hint}</AppText>}
                </View>
            </Pressable>
            {error && <AppText variant="caption" color="danger">{error}</AppText>}
        </View>
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
        gap: spacing.xxs,
    },
    checkContainer: {
        gap: spacing.xs,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
        backgroundColor: colors.cargoTint,
    },
    checkRowError: {
        borderColor: colors.danger,
    },
    box: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.asphalt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxOn: {
        backgroundColor: colors.asphalt,
    },
});
