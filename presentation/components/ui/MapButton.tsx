import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows, touchTarget } from "../../theme";

interface Props {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
}

// Botón redondo que flota sobre el mapa: abrir el menú, volver a la ubicación, encuadrar la ruta
export default function MapButton({ icon, label, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
            <Ionicons name={icon} size={24} color={colors.asphalt} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: touchTarget,
        height: touchTarget,
        borderRadius: touchTarget / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    pressed: {
        backgroundColor: colors.surfaceMuted,
    },
});
