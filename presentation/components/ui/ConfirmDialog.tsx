import { Modal, Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import AppText from "./AppText";
import Button from "./Button";
import { useTranslation } from 'react-i18next';
import { t } from '../../../i18n';

interface Props {
    visible: boolean;
    title: string;
    message?: string;
    confirmLabel: string;
    cancelLabel?: string;
    // danger: la acción no se puede deshacer (cancelar un flete, rechazar una oferta)
    tone?: 'default' | 'danger';
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    // Contenido extra entre el mensaje y los botones (motivos de cancelación)
    children?: React.ReactNode;
}

// Pregunta que pide decidir. El botón de confirmar dice qué pasa ("Cancelar flete"), nunca solo "Aceptar"
export default function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel = t('confirmDialog.volver'), tone = 'default', loading = false, onConfirm, onCancel, children }: Props) {
    const { t } = useTranslation();
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityRole="button" accessibilityLabel={t('common.cerrar')} />
                <View style={styles.dialog} accessibilityViewIsModal>
                    <AppText variant="title">{title}</AppText>
                    {message && <AppText variant="body" color="textMuted">{message}</AppText>}
                    {children}
                    <View style={styles.actions}>
                        <Button title={confirmLabel} variant={tone === 'danger' ? 'danger' : 'dark'} loading={loading} onPress={onConfirm} />
                        <Button title={cancelLabel} variant="text" disabled={loading} onPress={onCancel} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
        backgroundColor: colors.overlay,
    },
    dialog: {
        gap: spacing.md,
        padding: spacing.xl,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
    },
    actions: {
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
});
