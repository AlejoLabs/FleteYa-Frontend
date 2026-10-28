import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import PhotoStrip, { PhotoItem } from "../../../components/PhotoStrip";

interface Props {
    visible: boolean;
    photos: PhotoItem[];
    isSending: boolean;
    // Mensaje del último intento (código incorrecto, intentos agotados...)
    message: string | null;
    onTakePhoto: () => void;
    onSubmit: (code: string) => void;
    onClose: () => void;
}

// Prueba de entrega: foto de la carga entregada y el código de 4 dígitos que le dicta quien recibe
export default function DeliveryModal({ visible, photos, isSending, message, onTakePhoto, onSubmit, onClose }: Props) {
    const [code, setCode] = useState('');

    useEffect(() => {
        if (!visible) setCode('');
    }, [visible]);

    const canSubmit = photos.length > 0 && /^\d{4}$/.test(code) && !isSending;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.card}>
                    <Text style={styles.title}>Entregar la carga</Text>

                    <Text style={styles.step}>1. Toma una foto de la carga entregada</Text>
                    <PhotoStrip items={photos} onAdd={onTakePhoto} maxItems={3} addLabel="Tomar foto" />

                    <Text style={styles.step}>2. Escribe el código que te dicta quien recibe</Text>
                    <TextInput
                        style={styles.codeInput}
                        value={code}
                        onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
                        keyboardType="number-pad"
                        maxLength={4}
                        placeholder="0000"
                        placeholderTextColor="#bbb"
                    />
                    {message && <Text style={styles.message}>{message}</Text>}

                    <DefaultRoundedButton
                        text={isSending ? 'Confirmando...' : 'Confirmar entrega'}
                        backgroundColor={canSubmit ? 'black' : '#999'}
                        onPress={() => { if (canSubmit) onSubmit(code); }}
                        marginTop={14}
                        height={52}
                    />
                    <TouchableOpacity style={styles.cancel} onPress={onClose}>
                        <Text style={styles.cancelText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 22,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    step: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 14,
        marginBottom: 6,
    },
    codeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        fontSize: 32,
        letterSpacing: 16,
        textAlign: 'center',
        paddingVertical: 10,
        color: 'black',
    },
    message: {
        color: '#c62828',
        marginTop: 8,
        textAlign: 'center',
    },
    cancel: {
        alignSelf: 'center',
        padding: 12,
    },
    cancelText: {
        color: '#555',
        fontWeight: 'bold',
    },
});
