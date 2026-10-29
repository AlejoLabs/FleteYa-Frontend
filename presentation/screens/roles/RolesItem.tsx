import { View } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Role } from "../../../domain/models/Role";
import { AppText, Card } from "../../components/ui";
import { colors } from "../../theme";
import styles from "./Styles";

interface Props {
    role: Role;
    onPress: () => void;
}

// Textos propios por rol: el nombre y la imagen del backend son genéricos
const ROLE_COPY: Record<string, { title: string; description: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
    CLIENT: { title: 'Enviar una carga', description: 'Pide un flete y elige entre las ofertas de los conductores', icon: 'package-variant-closed' },
    DRIVER: { title: 'Transportar', description: 'Recibe solicitudes cerca y ofrece tu precio', icon: 'truck-outline' },
};

export default function RolesItem({ role, onPress }: Props) {
    const copy = ROLE_COPY[role.id] ?? { title: role.name, description: '', icon: 'account-outline' };
    return (
        <Card onPress={onPress} style={styles.card} accessibilityLabel={`${copy.title}. ${copy.description}`}>
            <View style={styles.iconPlate}>
                <MaterialCommunityIcons name={copy.icon} size={28} color={colors.asphalt} />
            </View>
            <View style={styles.texts}>
                <AppText variant="heading">{copy.title}</AppText>
                {copy.description !== '' && <AppText variant="small" color="textMuted">{copy.description}</AppText>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Card>
    );
}
