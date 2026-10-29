import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { AppText, ConfirmDialog, OptionCard, TextField } from "./ui";
import { spacing } from "../theme";

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
    const [selected, setSelected] = useState<string | null>(null);
    const [other, setOther] = useState('');
    const [error, setError] = useState<string | null>(null);
    const reason = selected === OTHER ? other.trim() : selected;

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
            setError(selected === OTHER ? 'Escribe el motivo' : 'Elige un motivo');
            return;
        }
        onConfirm(reason);
        reset();
    }

    return (
        <ConfirmDialog
            visible={visible}
            title={title}
            message="¿Por qué cancelas?"
            confirmLabel="Cancelar flete"
            tone="danger"
            onConfirm={confirm}
            onCancel={close}
        >
            <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent} keyboardShouldPersistTaps="handled">
                {[...reasons, OTHER].map((item) => (
                    <OptionCard
                        key={item}
                        title={item === OTHER ? 'Otro motivo' : item}
                        selected={selected === item}
                        onPress={() => { setSelected(item); setError(null); }}
                    />
                ))}
                {selected === OTHER &&
                    <TextField
                        value={other}
                        onChangeText={(value) => { setOther(value); setError(null); }}
                        placeholder="Escribe el motivo"
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
