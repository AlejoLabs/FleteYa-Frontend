import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Button, ProgressSteps } from "../../../../components/ui";
import { colors, radius, spacing, touchTarget } from "../../../../theme";
import { REQUEST_STEPS } from "../RequestDraft";

// Título del paso con "Paso 2 de 4" y la barra de avance
export function StepHeader({ title, step }: { title: string; step: number }) {
    return (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <AppText variant="title" style={styles.title} accessibilityRole="header">{title}</AppText>
                <AppText variant="caption" color="textMuted">Paso {step + 1} de {REQUEST_STEPS.length}</AppText>
            </View>
            <ProgressSteps steps={REQUEST_STEPS} current={step} showLabels={false} />
        </View>
    );
}

interface ActionsProps {
    onBack?: () => void;
    onNext: () => void;
    nextLabel?: string;
    loading?: boolean;
}

// Atrás y Continuar abajo de la hoja; el primer paso no tiene Atrás
export function StepActions({ onBack, onNext, nextLabel = 'Continuar', loading = false }: ActionsProps) {
    return (
        <View style={styles.actions}>
            {onBack && <Button title="Atrás" variant="secondary" disabled={loading} onPress={onBack} style={styles.back} />}
            <Button title={nextLabel} loading={loading} onPress={onNext} style={styles.next} />
        </View>
    );
}

interface PlaceRowProps {
    label: string;
    value?: string;
    placeholder: string;
    tone: 'origin' | 'destination';
    error?: string;
    onPress: () => void;
    actionLabel: string;
}

// Origen o destino: punto de color, la dirección y "Cambiar"
export function PlaceRow({ label, value, placeholder, tone, error, onPress, actionLabel }: PlaceRowProps) {
    return (
        <View style={styles.placeContainer}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [styles.place, pressed && styles.placePressed, !!error && styles.placeError]}
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${value ?? placeholder}. ${actionLabel}`}
            >
                {tone === 'origin'
                    ? <View style={styles.originDot} />
                    : <Ionicons name="location" size={22} color={colors.pinDestination} />}
                <View style={styles.placeTexts}>
                    <AppText variant="caption" color="textMuted">{label}</AppText>
                    <AppText variant={value ? 'bodyStrong' : 'body'} color={value ? 'text' : 'textMuted'} numberOfLines={2}>{value ?? placeholder}</AppText>
                </View>
                <AppText variant="smallStrong">{actionLabel}</AppText>
            </Pressable>
            {error && <AppText variant="caption" color="danger">{error}</AppText>}
        </View>
    );
}

// Resumen de una línea de lo ya elegido ("Bosa → Kennedy · 7,5 km") que lleva de vuelta a ese paso
export function SummaryRow({ icon, text, onPress }: { icon: keyof typeof Ionicons.glyphMap; text: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.summary, pressed && styles.placePressed]} accessibilityRole="button" accessibilityLabel={`${text}. Cambiar`}>
            <Ionicons name={icon} size={18} color={colors.textMuted} />
            <AppText variant="small" numberOfLines={1} style={styles.placeTexts}>{text}</AppText>
            <AppText variant="smallStrong">Cambiar</AppText>
        </Pressable>
    );
}

export function SectionLabel({ children }: { children: string }) {
    return <AppText variant="label" color="textMuted" style={styles.section}>{children}</AppText>;
}

const styles = StyleSheet.create({
    header: {
        gap: spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.md,
    },
    title: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    back: {
        flex: 1,
    },
    next: {
        flex: 2,
    },
    placeContainer: {
        gap: spacing.xs,
    },
    place: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget + 12,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
        backgroundColor: colors.surfaceMuted,
    },
    placePressed: {
        backgroundColor: colors.border,
    },
    placeError: {
        borderColor: colors.danger,
    },
    placeTexts: {
        flex: 1,
    },
    originDot: {
        width: 14,
        height: 14,
        marginHorizontal: 4,
        borderRadius: 7,
        backgroundColor: colors.pinOrigin,
    },
    summary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: touchTarget,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
    },
    section: {
        marginTop: spacing.xs,
    },
});
