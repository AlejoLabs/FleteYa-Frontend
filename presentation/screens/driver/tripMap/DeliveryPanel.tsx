import { useEffect, useState } from "react";
import { BackHandler, Keyboard, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader, AppText, Button, Card, CodeInput, KeyboardArea } from "../../../components/ui";
import PhotoStrip, { PhotoItem } from "../../../components/PhotoStrip";
import { colors, spacing } from "../../../theme";
import { useTranslation } from 'react-i18next';

const CODE_LENGTH = 4;
const MAX_DELIVERY_PHOTOS = 3;

interface Props {
    destination: string;
    // "Recibe Marta Ruiz · piso 3 sin ascensor"; vacío si recibe el mismo cliente
    receiverText: string | null;
    photos: PhotoItem[];
    isSending: boolean;
    // Mensaje del último intento (código incorrecto, intentos agotados...)
    error: string | null;
    onTakePhoto: () => void;
    onSubmit: (code: string) => void;
    onReport: () => void;
    onClose: () => void;
}

// Prueba de entrega: foto de la carga entregada y el código de 4 dígitos que le dicta quien recibe.
// Es una capa y no un Modal: un Modal abre otra ventana y taparía los avisos de la app
export default function DeliveryPanel({ destination, receiverText, photos, isSending, error, onTakePhoto, onSubmit, onReport, onClose }: Props) {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const close = () => { Keyboard.dismiss(); onClose(); };
    const missing = photos.length === 0 ? t('deliveryPanel.tomaAlMenosUnaFoto') : code.length < CODE_LENGTH ? t('deliveryPanel.escribeElCodigoCompleto') : null;

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            close();
            return true;
        });
        return () => subscription.remove();
    }, []);

    return (
        <SafeAreaView style={styles.screen}>
            <AppHeader title={t('deliveryPanel.entregarCarga')} onBack={close} />
            <KeyboardArea style={styles.flex} aboveBottomInset>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Card variant="muted" style={styles.destination}>
                        <AppText variant="caption" color="textMuted">{t('common.destino')}</AppText>
                        <AppText variant="bodyStrong">{destination}</AppText>
                        {receiverText && <AppText variant="small" color="textMuted">{receiverText}</AppText>}
                    </Card>

                    <View style={styles.block}>
                        <AppText variant="smallStrong">{t('deliveryPanel.fotoDeLaEntrega')}</AppText>
                        <PhotoStrip items={photos} onAdd={onTakePhoto} maxItems={MAX_DELIVERY_PHOTOS} addLabel={photos.length ? t('deliveryPanel.otraFoto') : t('deliveryPanel.tomarFoto')} />
                    </View>

                    <View style={styles.block}>
                        <CodeInput
                            label={t('deliveryPanel.codigoQueTeDictaQuien')}
                            value={code}
                            onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                            length={CODE_LENGTH}
                            error={error}
                        />
                        {/* Tras un intento fallido el error ya dice cuántos quedan */}
                        {!error && <AppText variant="small" color="textMuted">{t('deliveryPanel.elClienteLoVeEn')}</AppText>}
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                    <Button
                        title={t('deliveryPanel.confirmarEntrega')}
                        loading={isSending}
                        disabled={missing !== null}
                        onPress={() => { Keyboard.dismiss(); onSubmit(code); }}
                    />
                    {missing && <AppText variant="caption" color="textMuted" align="center">{missing}</AppText>}
                    <Button title={t('common.reportarUnProblema')} variant="text" onPress={onReport} />
                </View>
            </KeyboardArea>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
    },
    flex: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.xl,
    },
    destination: {
        gap: spacing.xxs,
    },
    block: {
        gap: spacing.sm,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
