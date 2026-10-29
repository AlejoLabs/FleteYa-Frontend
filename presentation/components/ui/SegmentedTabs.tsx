import { Pressable, StyleSheet, View } from "react-native";
import { colors, radius, shadows, spacing } from "../../theme";
import AppText from "./AppText";

interface Props<T> {
    options: { value: T; label: string }[];
    selected: T;
    onSelect: (value: T) => void;
}

// Dos o tres opciones excluyentes en una barra: "Ahora / Programar", "Activos / Terminados"
export default function SegmentedTabs<T>({ options, selected, onSelect }: Props<T>) {
    return (
        <View style={styles.container} accessibilityRole="tablist">
            {options.map((option) => {
                const isSelected = option.value === selected;
                return (
                    <Pressable
                        key={String(option.value)}
                        onPress={() => onSelect(option.value)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isSelected }}
                        style={[styles.tab, isSelected && styles.tabOn]}
                    >
                        <AppText variant="smallStrong" color={isSelected ? 'text' : 'textMuted'} numberOfLines={1}>{option.label}</AppText>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.xs,
        padding: spacing.xs,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
    },
    tab: {
        flex: 1,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
        borderRadius: radius.sm,
    },
    tabOn: {
        backgroundColor: colors.surface,
        ...shadows.card,
    },
});
