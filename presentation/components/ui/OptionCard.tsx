import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, touchTarget } from "../../theme";
import AppText from "./AppText";

interface Props {
    title: string;
    description?: string;
    selected: boolean;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    disabled?: boolean;
}

// Opción grande con radio: elegir rol, medio de pago o motivo de cancelación
export default function OptionCard({ title, description, selected, onPress, icon, disabled = false }: Props) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed, disabled && styles.disabled]}
        >
            <View style={[styles.radio, selected && styles.radioOn]} />
            {icon && <Ionicons name={icon} size={22} color={colors.asphalt} />}
            <View style={styles.texts}>
                <AppText variant="bodyStrong">{title}</AppText>
                {description && <AppText variant="small" color="textMuted">{description}</AppText>}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget + 8,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    selected: {
        borderWidth: 2,
        borderColor: colors.asphalt,
    },
    pressed: {
        backgroundColor: colors.surfaceMuted,
    },
    disabled: {
        opacity: 0.5,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.borderStrong,
    },
    radioOn: {
        borderWidth: 6,
        borderColor: colors.asphalt,
    },
    texts: {
        flex: 1,
        gap: spacing.xxs,
    },
});
