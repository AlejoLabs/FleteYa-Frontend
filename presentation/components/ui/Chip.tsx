import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme";
import AppText from "./AppText";

interface ChipProps {
    label: string;
    selected?: boolean;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    // tag: etiqueta informativa que no se toca ("Frágil", "Cabe en tu furgón")
    tone?: 'default' | 'cargo' | 'success';
    onPress?: () => void;
}

const TONES = {
    default: { background: colors.surfaceMuted, text: colors.text },
    cargo: { background: colors.cargoTint, text: colors.text },
    success: { background: colors.successTint, text: colors.success },
};

export function Chip({ label, selected = false, disabled = false, icon, tone = 'default', onPress }: ChipProps) {
    const background = selected ? colors.asphalt : TONES[tone].background;
    const textColor = selected ? colors.textOnDark : disabled ? colors.textDisabled : TONES[tone].text;
    const content = (
        <>
            {icon && <Ionicons name={icon} size={14} color={textColor} />}
            <AppText variant="smallStrong" style={{ color: textColor }}>{label}</AppText>
        </>
    );

    if (!onPress) return <View style={[styles.chip, styles.tag, { backgroundColor: background }]}>{content}</View>;
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
            style={({ pressed }) => [styles.chip, { backgroundColor: background }, pressed && !selected && styles.pressed]}
        >
            {content}
        </Pressable>
    );
}

export interface ChipOption<T> {
    value: T;
    label: string;
    disabled?: boolean;
}

interface GroupProps<T> {
    options: ChipOption<T>[];
    selected: T | null;
    onSelect: (value: T) => void;
}

// Selector de una opción en fichas; las deshabilitadas se ven pero no se pueden tocar
export function ChipGroup<T>({ options, selected, onSelect }: GroupProps<T>) {
    return (
        <View style={styles.group} accessibilityRole="radiogroup">
            {options.map((option) => (
                <Chip
                    key={String(option.value)}
                    label={option.label}
                    selected={option.value === selected}
                    disabled={option.disabled}
                    onPress={() => onSelect(option.value)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: 40,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
    },
    tag: {
        minHeight: 28,
        paddingHorizontal: spacing.sm + 2,
    },
    pressed: {
        backgroundColor: colors.border,
    },
    group: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
});
