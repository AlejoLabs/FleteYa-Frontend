import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    title: string;
    onBack: () => void;
}

// Barra con volver y título, debajo de la del menú lateral (que ya cubre la barra de estado).
// Va dentro de la pantalla, no como header del stack, para que el teclado no tape el contenido
export default function ScreenHeader({ title, onBack }: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onBack} hitSlop={12} accessibilityLabel="Volver">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        elevation: 2,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
