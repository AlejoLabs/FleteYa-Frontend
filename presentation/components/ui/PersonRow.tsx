import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../theme";
import AppText from "./AppText";
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/Formatters';

interface RatingProps {
    rating?: { average: number | null; count: number } | null;
    tone?: 'light' | 'dark';
}

// "★ 4,6 (12)" o "Nuevo" cuando todavía no tiene votos
export function RatingBadge({ rating, tone = 'light' }: RatingProps) {
    const { t } = useTranslation();
    const muted = tone === 'dark' ? colors.textOnDarkMuted : colors.textMuted;
    if (!rating || rating.average === null) {
        return <AppText variant="caption" style={{ color: muted }}>{t('personRow.nuevo')}</AppText>;
    }
    return (
        <View style={styles.rating} accessibilityLabel={t('personRow.calificacionDe5Votos', { average: rating.average, count: rating.count })}>
            <Ionicons name="star" size={12} color={colors.star} />
            <AppText variant="caption" style={{ color: tone === 'dark' ? colors.textOnDark : colors.text }}>
                {formatNumber(rating.average, 1, 1)}
            </AppText>
            <AppText variant="caption" style={{ color: muted }}>({rating.count})</AppText>
        </View>
    );
}

interface AvatarProps {
    name: string;
    imageUri?: string | null;
    size?: number;
}

// Foto de perfil o, si no hay, las iniciales sobre asfalto
export function Avatar({ name, imageUri, size = 44 }: AvatarProps) {
    const shape = { width: size, height: size, borderRadius: size / 2 };
    if (imageUri) return <Image source={{ uri: imageUri }} style={[shape, styles.image]} accessibilityIgnoresInvertColors />;
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
    return (
        <View style={[shape, styles.initials]}>
            <AppText variant="bodyStrong" color="cargo" style={{ fontSize: size * 0.38 }}>{initials || '?'}</AppText>
        </View>
    );
}

interface PersonRowProps {
    name: string;
    subtitle?: string;
    imageUri?: string | null;
    rating?: { average: number | null; count: number } | null;
    right?: React.ReactNode;
    tone?: 'light' | 'dark';
}

// Conductor o cliente con foto, calificación y un dato (vehículo, placa, distancia)
export function PersonRow({ name, subtitle, imageUri, rating, right, tone = 'light' }: PersonRowProps) {
    const dark = tone === 'dark';
    return (
        <View style={styles.row}>
            <Avatar name={name} imageUri={imageUri} />
            <View style={styles.texts}>
                <View style={styles.nameLine}>
                    <AppText variant="bodyStrong" style={{ color: dark ? colors.textOnDark : colors.text, flexShrink: 1 }} numberOfLines={1}>{name}</AppText>
                    {rating !== undefined && <RatingBadge rating={rating} tone={tone} />}
                </View>
                {subtitle && <AppText variant="small" style={{ color: dark ? colors.textOnDarkMuted : colors.textMuted }} numberOfLines={1}>{subtitle}</AppText>}
            </View>
            {right}
        </View>
    );
}

const styles = StyleSheet.create({
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    image: {
        backgroundColor: colors.surfaceMuted,
    },
    initials: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.asphalt,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    texts: {
        flex: 1,
        gap: spacing.xxs,
    },
    nameLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
});
