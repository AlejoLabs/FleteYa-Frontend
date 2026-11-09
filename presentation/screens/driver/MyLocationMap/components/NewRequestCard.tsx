import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Amount, AppText, Button } from "../../../../components/ui";
import { colors, radius, shadows, spacing } from "../../../../theme";
import { useTranslation } from 'react-i18next';

interface Props {
    fare: number;
    // "Mudanza · a 0,3 km · Paga por la app"
    detail: string;
    onOpen: () => void;
    onDismiss: () => void;
}

// Tarjeta que sube desde abajo cuando llega una solicitud nueva que le sirve al conductor
export default function NewRequestCard({ fare, detail, onOpen, onDismiss }: Props) {
    const { t } = useTranslation();
    const enter = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(enter, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    }, [fare, detail]);

    return (
        <Animated.View
            style={[styles.card, { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}
            accessibilityLiveRegion="polite"
        >
            <View style={styles.top}>
                <View style={styles.badge}>
                    <Ionicons name="notifications" size={14} color={colors.asphalt} />
                    <AppText variant="caption" style={styles.badgeText}>{t('newRequestCard.nuevaSolicitudCerca')}</AppText>
                </View>
                <Pressable onPress={onDismiss} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('newRequestCard.cerrarAviso')}>
                    <Ionicons name="close" size={22} color={colors.textOnDarkMuted} />
                </Pressable>
            </View>
            <Amount value={fare} size="lg" color="textOnDark" />
            <AppText variant="small" color="textOnDarkMuted">{detail}</AppText>
            <Button title={t('newRequestCard.verSolicitud')} onPress={onOpen} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.asphalt,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
        ...shadows.sheet,
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.pill,
        backgroundColor: colors.cargo,
    },
    badgeText: {
        color: colors.asphalt,
    },
});
