import { View } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Role } from "../../../domain/models/Role";
import { AppText, Card } from "../../components/ui";
import { colors } from "../../theme";
import styles from "./Styles";
import { useTranslation } from 'react-i18next';
import { tk } from '../../../i18n';

interface Props {
    role: Role;
    onPress: () => void;
}

// Textos propios por rol: el nombre y la imagen del backend son genéricos
const ROLE_COPY: Record<string, { title: string; description: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
    CLIENT: { title: tk('rolesItem.enviarUnaCarga'), description: tk('rolesItem.pideUnFleteYElige'), icon: 'package-variant-closed' },
    DRIVER: { title: tk('rolesItem.transportar'), description: tk('rolesItem.recibeSolicitudesCercaYOfrece'), icon: 'truck-outline' },
};

export default function RolesItem({ role, onPress }: Props) {
    const { t } = useTranslation();
    const base = ROLE_COPY[role.id] ?? { title: role.name, description: '', icon: 'account-outline' };
    const copy = ROLE_COPY[role.id] ? { ...base, title: t(base.title), description: t(base.description) } : base;
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
