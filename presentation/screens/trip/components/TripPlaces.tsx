import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { useTranslation } from 'react-i18next';

interface Props {
    pickup: string;
    destination: string;
    // Con la carga a bordo la recogida ya pasó: se ve apagada
    pickupDone: boolean;
}

// Recogida y destino del viaje, uno debajo del otro con sus puntos de color como en el mapa
export default function TripPlaces({ pickup, destination, pickupDone }: Props) {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.marker}><View style={[styles.pickupDot, pickupDone && styles.done]} /></View>
                <View style={styles.texts}>
                    <AppText variant="caption" color="textMuted">{t('tripPlaces.recogida')}</AppText>
                    <AppText variant={pickupDone ? 'small' : 'smallStrong'} color={pickupDone ? 'textMuted' : 'text'} numberOfLines={2}>{pickup}</AppText>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.marker}><Ionicons name="location" size={20} color={colors.pinDestination} /></View>
                <View style={styles.texts}>
                    <AppText variant="caption" color="textMuted">{t('common.destino')}</AppText>
                    <AppText variant="smallStrong" numberOfLines={2}>{destination}</AppText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    marker: {
        width: 24,
        alignItems: 'center',
    },
    pickupDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.pinOrigin,
    },
    done: {
        backgroundColor: colors.textDisabled,
    },
    texts: {
        flex: 1,
    },
});
