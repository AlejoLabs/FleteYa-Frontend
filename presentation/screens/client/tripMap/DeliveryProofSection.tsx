import { StyleSheet, View } from "react-native";
import { Photo } from "../../../../domain/models/Photo";
import PhotoStrip from "../../../components/PhotoStrip";
import { AppText } from "../../../components/ui";
import { colors, fonts, radius, spacing } from "../../../theme";

interface Props {
    deliveryCode?: string | null;
    // Quien recibe, si no es el cliente; a esa persona hay que pasarle el código
    receiverName?: string | null;
    photos: Photo[];
}

const KIND_LABELS: Record<string, string> = { PICKUP: 'Al cargar', DELIVERY: 'Al entregar' };

// Prueba de entrega del lado del cliente: el código para quien recibe y las fotos que toma el conductor
export default function DeliveryProofSection({ deliveryCode, receiverName, photos }: Props) {
    const proofPhotos = photos.filter((photo) => photo.kind !== 'CARGO');
    return (
        <>
            {deliveryCode &&
                <View style={styles.codeCard}>
                    <View style={styles.codeTexts}>
                        <AppText variant="label" color="textMuted">Código de entrega</AppText>
                        <AppText variant="small">
                            {receiverName
                                ? `Pásaselo a ${receiverName}: se lo dicta al conductor al recibir la carga.`
                                : 'Díctaselo al conductor cuando recibas la carga. Sin él no puede cerrar el viaje.'}
                        </AppText>
                    </View>
                    <AppText style={styles.code} accessibilityLabel={`Código de entrega ${deliveryCode.split('').join(' ')}`}>{deliveryCode}</AppText>
                </View>
            }

            {proofPhotos.length > 0 &&
                <View style={styles.photos}>
                    <AppText variant="label" color="textMuted">Fotos del conductor</AppText>
                    {['PICKUP', 'DELIVERY'].map((kind) => {
                        const ofKind = proofPhotos.filter((photo) => photo.kind === kind);
                        return ofKind.length > 0 && (
                            <View key={kind} style={styles.kind}>
                                <AppText variant="caption" color="textMuted">{KIND_LABELS[kind]}</AppText>
                                <PhotoStrip items={ofKind.map((photo) => ({ key: String(photo.id), path: photo.url }))} />
                            </View>
                        );
                    })}
                </View>
            }
        </>
    );
}

const styles = StyleSheet.create({
    codeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.cargoTint,
    },
    codeTexts: {
        flex: 1,
        gap: spacing.xxs,
    },
    // Grande y espaciado para dictarlo de lejos o mostrar la pantalla
    code: {
        fontFamily: fonts.displayHeavy,
        fontSize: 36,
        lineHeight: 40,
        letterSpacing: 6,
        color: colors.text,
    },
    photos: {
        gap: spacing.xs,
    },
    kind: {
        gap: spacing.xxs,
    },
});
