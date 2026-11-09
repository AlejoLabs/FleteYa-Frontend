import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme";
import AppText from "./AppText";
import { useTranslation } from 'react-i18next';

// Logo de FleteYa sobre fondo asfalto: el camión en la placa amarilla y "Ya" en amarillo
export default function BrandMark() {
    const { t } = useTranslation();
    return (
        <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel={t('brandMark.fleteya')}>
            <View style={styles.plate}>
                <MaterialCommunityIcons name="truck-outline" size={30} color={colors.asphalt} />
            </View>
            <AppText variant="brand" color="textOnDark">
                {/* i18n-ignore: el nombre de la marca no se traduce */}
                Flete<Text style={{ color: colors.cargo }}>Ya</Text>
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    plate: {
        width: 52,
        height: 52,
        borderRadius: radius.md,
        backgroundColor: colors.cargo,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
