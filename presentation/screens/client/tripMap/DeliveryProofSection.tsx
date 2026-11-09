import { Share, StyleSheet, View } from "react-native";
import { Photo } from "../../../../domain/models/Photo";
import PhotoStrip from "../../../components/PhotoStrip";
import { AppText, Button, Notice } from "../../../components/ui";
import { colors, fonts, radius, spacing } from "../../../theme";
import { useTranslation } from 'react-i18next';
import { t, tk } from '../../../../i18n';

interface Props {
    deliveryCode?: string | null;
    // Quien recibe, si no es el cliente; a esa persona hay que pasarle el código
    receiverName?: string | null;
    // El conductor agotó los intentos del código: el cliente confirma desde el botón de abajo
    deliveryLocked: boolean;
    photos: Photo[];
}

const KIND_LABELS: Record<string, string> = { PICKUP: tk('deliveryProofSection.alCargar'), DELIVERY: tk('deliveryProofSection.alEntregar') };

// Prueba de entrega del lado del cliente: el código para quien recibe y las fotos que toma el conductor
export default function DeliveryProofSection({ deliveryCode, receiverName, deliveryLocked, photos }: Props) {
    const { t } = useTranslation();
    const proofPhotos = photos.filter((photo) => photo.kind !== 'CARGO');

    // Para quien recibe la carga en el destino: le llega por WhatsApp, mensaje o la app que elija el cliente
    const shareCode = () => Share.share({
        message: t('deliveryProofSection.codigoDeEntregaDeFleteya', { deliveryCode }),
    });

    return (
        <>
            {deliveryLocked &&
                <Notice tone="warning" title={t('deliveryProofSection.elCodigoNoFunciono')} message={t('deliveryProofSection.elConductorAgotoLosIntentos')} />}
            {deliveryCode && !deliveryLocked &&
                <View style={styles.codeBlock}>
                    <View style={styles.codeCard}>
                        <View style={styles.codeTexts}>
                            <AppText variant="label" color="textMuted">{t('deliveryProofSection.codigoDeEntrega')}</AppText>
                            <AppText variant="small">
                                {receiverName
                                    ? t('deliveryProofSection.pasaseloASeLoDicta', { receiverName })
                                    : t('deliveryProofSection.dictaseloAlConductorCuandoRecibas')}
                            </AppText>
                        </View>
                        <AppText style={styles.code} accessibilityLabel={t('deliveryProofSection.codigoDeEntrega2', { split: deliveryCode.split('').join(' ') })}>{deliveryCode}</AppText>
                    </View>
                    {receiverName && <Button title={t('deliveryProofSection.compartirCodigoCon', { receiverName })} icon="share-social-outline" variant="secondary" size="sm" onPress={shareCode} />}
                </View>
            }

            {proofPhotos.length > 0 &&
                <View style={styles.photos}>
                    <AppText variant="label" color="textMuted">{t('deliveryProofSection.fotosDelConductor')}</AppText>
                    {['PICKUP', 'DELIVERY'].map((kind) => {
                        const ofKind = proofPhotos.filter((photo) => photo.kind === kind);
                        return ofKind.length > 0 && (
                            <View key={kind} style={styles.kind}>
                                <AppText variant="caption" color="textMuted">{t(KIND_LABELS[kind])}</AppText>
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
