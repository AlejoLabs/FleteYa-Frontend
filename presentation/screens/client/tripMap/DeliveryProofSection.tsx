import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Photo } from "../../../../domain/models/Photo";
import PhotoStrip from "../../../components/PhotoStrip";

interface Props {
    deliveryCode?: string | null;
    // Quien recibe, si no es el cliente; a esa persona hay que pasarle el código
    receiverName?: string | null;
    photos: Photo[];
    // Solo con la carga en camino el cliente puede confirmar que la recibió
    canConfirm: boolean;
    onConfirm: () => void;
}

const KIND_LABELS: Record<string, string> = { CARGO: 'Tu carga', PICKUP: 'Al cargar', DELIVERY: 'Al entregar' };

// Prueba de entrega del lado del cliente: el código para quien recibe y las fotos que toma el conductor
export default function DeliveryProofSection({ deliveryCode, receiverName, photos, canConfirm, onConfirm }: Props) {
    const proofPhotos = photos.filter((photo) => photo.kind !== 'CARGO');
    return (
        <View>
            {deliveryCode &&
                <View style={styles.codeCard}>
                    <Text style={styles.codeLabel}>Código de entrega</Text>
                    <Text style={styles.code} accessibilityLabel={`Código de entrega ${deliveryCode.split('').join(' ')}`}>{deliveryCode}</Text>
                    <Text style={styles.codeHint}>
                        {receiverName
                            ? `Pásaselo a ${receiverName}: se lo dicta al conductor cuando reciba la carga.`
                            : 'Díctaselo al conductor cuando recibas la carga. Sin él no puede cerrar el viaje.'}
                    </Text>
                </View>
            }

            {proofPhotos.length > 0 &&
                <View style={styles.photos}>
                    <Text style={styles.title}>FOTOS DEL CONDUCTOR</Text>
                    {['PICKUP', 'DELIVERY'].map((kind) => {
                        const ofKind = proofPhotos.filter((photo) => photo.kind === kind);
                        return ofKind.length > 0 && (
                            <View key={kind}>
                                <Text style={styles.kind}>{KIND_LABELS[kind]}</Text>
                                <PhotoStrip items={ofKind.map((photo) => ({ key: String(photo.id), path: photo.url }))} />
                            </View>
                        );
                    })}
                </View>
            }

            {canConfirm &&
                <TouchableOpacity style={styles.confirm} onPress={onConfirm}>
                    <Text style={styles.confirmText}>Ya recibí la carga</Text>
                </TouchableOpacity>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    codeCard: {
        marginHorizontal: 20,
        marginTop: 14,
        padding: 14,
        borderRadius: 16,
        backgroundColor: '#fff4e0',
        alignItems: 'center',
    },
    codeLabel: {
        fontWeight: 'bold',
        color: '#7a4b00',
    },
    code: {
        fontSize: 40,
        fontWeight: 'bold',
        letterSpacing: 12,
        color: 'black',
        marginVertical: 4,
    },
    codeHint: {
        textAlign: 'center',
        color: '#5c4200',
    },
    photos: {
        marginHorizontal: 20,
        marginTop: 14,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 4,
    },
    kind: {
        color: '#555',
        marginTop: 4,
    },
    confirm: {
        marginHorizontal: 20,
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 26,
        backgroundColor: 'green',
        alignItems: 'center',
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
