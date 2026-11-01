import { Share, StyleSheet, View } from "react-native";
import { Photo } from "../../../../domain/models/Photo";
import PhotoStrip from "../../../components/PhotoStrip";
import { AppText, Button, Notice } from "../../../components/ui";
import { colors, fonts, radius, spacing } from "../../../theme";

interface Props {
    deliveryCode?: string | null;
    // Quien recibe, si no es el cliente; a esa persona hay que pasarle el código
    receiverName?: string | null;
    // El conductor agotó los intentos del código: el cliente confirma desde el botón de abajo
    deliveryLocked: boolean;
    photos: Photo[];
}

const KIND_LABELS: Record<string, string> = { PICKUP: 'Al cargar', DELIVERY: 'Al entregar' };

// Prueba de entrega del lado del cliente: el código para quien recibe y las fotos que toma el conductor
export default function DeliveryProofSection({ deliveryCode, receiverName, deliveryLocked, photos }: Props) {
    const proofPhotos = photos.filter((photo) => photo.kind !== 'CARGO');

    // Para quien recibe la carga en el destino: le llega por WhatsApp, mensaje o la app que elija el cliente
    const shareCode = () => Share.share({
        message: `Código de entrega de FleteYa: ${deliveryCode}. Díctaselo al conductor cuando recibas la carga, no antes.`,
    });

    return (
        <>
            {deliveryLocked &&
                <Notice tone="warning" title="El código no funcionó" message="El conductor agotó los intentos. Si ya tienes la carga, confírmalo con el botón de abajo." />}
            {deliveryCode && !deliveryLocked &&
                <View style={styles.codeBlock}>
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
                    {receiverName && <Button title={`Compartir código con ${receiverName}`} icon="share-social-outline" variant="secondary" size="sm" onPress={shareCode} />}
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
    codeBlock: {
        gap: spacing.sm,
    },
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
