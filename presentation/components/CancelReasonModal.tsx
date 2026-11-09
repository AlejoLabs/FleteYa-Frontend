import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { AppText, ConfirmDialog, OptionCard, TextField } from "./ui";
import { spacing } from "../theme";
import { useTranslation } from 'react-i18next';
import { t } from '../../i18n';

interface Props {
    visible: boolean;
    title: string;
    reasons: string[];
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const OTHER = 'OTRO';

// Cancelar siempre pide un motivo: uno de la lista o uno escrito
export default function CancelReasonModal({ visible, title, reasons, onClose, onConfirm }: Props) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string | null>(null);
    const [other, setOther] = useState('');
    const [error, setError] = useState<string | null>(null);
    // Los motivos de la lista se guardan en el idioma de quien cancela
    const reason = selected === OTHER ? other.trim() : selected ? t(selected) : null;

    const reset = () => {
        setSelected(null);
        setOther('');
        setError(null);
    }

    const close = () => {
        reset();
        onClose();
    }

    const confirm = () => {
        if (!reason || reason.length < 3) {
            setError(selected === OTHER ? t('cancelReasonModal.escribeElMotivo') : t('cancelReasonModal.eligeUnMotivo'));
            return;
        }
        onConfirm(reason);
        reset();
    }

    return (
        <ConfirmDialog
            visible={visible}
            title={title}
            message={t('cancelReasonModal.porQueCancelas')}
            confirmLabel={t('common.cancelarFlete')}
            tone="danger"
            onConfirm={confirm}
            onCancel={close}
        >
            <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent} keyboardShouldPersistTaps="handled">
                {[...reasons, OTHER].map((item) => (
                    <OptionCard
                        key={item}
                        title={item === OTHER ? t('cancelReasonModal.otroMotivo') : t(item)}
                        selected={selected === item}
                        onPress={() => { setSelected(item); setError(null); }}
                    />
                ))}
                {selected === OTHER &&
                    <TextField
                        value={other}
                        onChangeText={(value) => { setOther(value); setError(null); }}
                        placeholder={t('cancelReasonModal.escribeElMotivo')}
                        error={error}
                        maxLength={255}
                        autoFocus
                    />
                }
                {error && selected !== OTHER && <AppText variant="caption" color="danger">{error}</AppText>}
            </ScrollView>
        </ConfirmDialog>
    );
}

const styles = StyleSheet.create({
    options: {
        maxHeight: 360,
    },
    optionsContent: {
        gap: spacing.sm,
    },
});
