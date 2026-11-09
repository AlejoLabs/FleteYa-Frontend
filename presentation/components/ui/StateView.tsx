import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../theme";
import AppText from "./AppText";
import Button from "./Button";
import { useTranslation } from 'react-i18next';
import { tk } from '../../../i18n';

export type StateKind = 'loading' | 'empty' | 'error' | 'offline';

interface Props {
    kind: StateKind;
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    // Icono del estado vacío según la pantalla (historial, chat, próximos fletes)
    icon?: keyof typeof Ionicons.glyphMap;
}

const DEFAULTS: Record<Exclude<StateKind, 'loading'>, { icon: keyof typeof Ionicons.glyphMap; title: string; message: string }> = {
    empty: { icon: 'cube-outline', title: tk('state.todaviaNoHayNadaAqui'), message: '' },
    error: { icon: 'warning-outline', title: tk('state.algoSalioMal'), message: tk('state.noPudimosCargarLaInformacion') },
    offline: { icon: 'cloud-offline-outline', title: tk('state.sinConexion'), message: tk('state.revisaTuInternetCuandoVuelva') },
};

const CIRCLE: Record<Exclude<StateKind, 'loading'>, { background: string; icon: string }> = {
    empty: { background: colors.cargoTint, icon: colors.asphalt },
    error: { background: colors.dangerTint, icon: colors.danger },
    offline: { background: colors.infoTint, icon: colors.info },
};

// Un solo patrón para cargando, vacío, error y sin conexión en todas las pantallas
export default function StateView({ kind, title, message, actionLabel, onAction, icon }: Props) {
    const { t } = useTranslation();
    if (kind === 'loading') {
        return (
            <View style={styles.container} accessibilityLiveRegion="polite">
                <ActivityIndicator size="large" color={colors.asphalt} />
                <AppText variant="small" color="textMuted" align="center">{message ?? t('state.cargando')}</AppText>
            </View>
        );
    }

    const preset = DEFAULTS[kind];
    const text = message ?? (preset.message ? t(preset.message) : '');
    return (
        <View style={styles.container} accessibilityLiveRegion="polite">
            <View style={[styles.iconCircle, { backgroundColor: CIRCLE[kind].background }]}>
                <Ionicons name={icon ?? preset.icon} size={32} color={CIRCLE[kind].icon} />
            </View>
            <AppText variant="heading" align="center">{title ?? t(preset.title)}</AppText>
            {text ? <AppText variant="small" color="textMuted" align="center">{text}</AppText> : null}
            {onAction && <Button title={actionLabel ?? t('state.reintentar')} variant="dark" size="sm" onPress={onAction} style={styles.action} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.xl,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    action: {
        marginTop: spacing.sm,
        minWidth: 160,
    },
});
