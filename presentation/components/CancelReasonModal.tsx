import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import DefaultRoundedButton from "./DefaultRoundedButton";

interface Props {
    visible: boolean;
    title: string;
    reasons: string[];
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

// Cancelar siempre pide un motivo: uno de la lista o uno escrito
export default function CancelReasonModal({ visible, title, reasons, onClose, onConfirm }: Props) {
    const [selected, setSelected] = useState<string | null>(null);
    const [other, setOther] = useState('');
    const reason = selected === 'OTRO' ? other.trim() : selected;

    const close = () => {
        setSelected(null);
        setOther('');
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
            <Pressable style={styles.overlay} onPress={close}>
                <Pressable style={styles.content} onPress={() => { }}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>¿Por qué cancelas?</Text>
                    {[...reasons, 'OTRO'].map((item) => (
                        <TouchableOpacity key={item} style={styles.option} onPress={() => setSelected(item)}>
                            <View style={[styles.radio, selected === item && styles.radioSelected]} />
                            <Text style={styles.optionText}>{item === 'OTRO' ? 'Otro motivo' : item}</Text>
                        </TouchableOpacity>
                    ))}
                    {selected === 'OTRO' &&
                        <TextInput
                            value={other}
                            onChangeText={setOther}
                            placeholder="Escribe el motivo"
                            placeholderTextColor="#888"
                            style={styles.input}
                            maxLength={255}
                        />
                    }
                    <DefaultRoundedButton
                        text="Cancelar flete"
                        backgroundColor={reason && reason.length >= 3 ? 'red' : '#e7a0a0'}
                        onPress={() => {
                            if (!reason || reason.length < 3) return;
                            onConfirm(reason);
                            setSelected(null);
                            setOther('');
                        }}
                    />
                    <DefaultRoundedButton text="Volver" backgroundColor="gray" marginTop={10} onPress={close} />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        color: 'gray',
        marginTop: 4,
        marginBottom: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#999',
        marginRight: 10,
    },
    radioSelected: {
        borderColor: 'black',
        backgroundColor: 'black',
    },
    optionText: {
        fontSize: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
        backgroundColor: '#f7f7f7',
    },
});
