import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { container } from "../../../../di/container";
import { TripSharedParamList } from "../../../navigator/TripSharedParamList";
import { useAuth } from "../../../hooks/useAuth";
import { AppHeader, AppText, Button, Card, ReceiptCard, StateView } from "../../../components/ui";
import { formatTripDate } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";
import { shortPlace } from "../TripStatus";
import { ReceiptViewModel } from "./ReceiptViewModel";
import { useReceipt } from "./useReceipt";
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<TripSharedParamList, 'ReceiptScreen'>;

// Comprobante del flete pagado: tipo y número, fecha, recorrido, personas, desglose con el impuesto del país y total.
// Se abre justo después de pagar (desde ahí se pasa a calificar) y desde el historial
export function ReceiptScreen({ navigation, route }: Props) {
    const { t } = useTranslation();
    const { idClientRequest, afterPayment = false } = route.params;
    const viewModel: ReceiptViewModel = container.resolve('receiptViewModel');
    const { authResponse } = useAuth();
    const { receipt, request, failed, reload } = useReceipt(viewModel, idClientRequest, afterPayment);

    const goBack = () => navigation.canGoBack() ? navigation.goBack() : (navigation as any).navigate('ClientTripHistoryScreen');

    // Cada stack tiene su propia pantalla de calificación
    const goToRating = () => {
        if (!request) return;
        const isClient = viewModel.isClient(request, authResponse?.user.id);
        (navigation as any).replace(isClient ? 'ClientTripRatingScreen' : 'DriverTripRatingScreen', { clientRequest: request });
    }

    if (!receipt) {
        return (
            <SafeAreaView style={[styles.screen, styles.center]} edges={['top', 'bottom']}>
                {failed
                    ? <StateView kind="error" message={t('receipt.noPudimosCargarElComprobante')} onAction={reload} />
                    : <StateView kind="loading" message={t('receipt.cargandoElComprobante')} />}
            </SafeAreaView>
        );
    }

    const other = request ? (viewModel.isClient(request, authResponse?.user.id) ? request.driver : request.client) : null;

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader title={t('receipt.comprobante')} onBack={afterPayment ? undefined : goBack} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heading}>
                    <View style={styles.badge}>
                        <Ionicons name="receipt-outline" size={32} color={colors.textOnDark} />
                    </View>
                    <AppText variant="display" align="center" accessibilityRole="header">{viewModel.typeName(receipt)}</AppText>
                    <AppText variant="bodyStrong" align="center">{t('receipt.numero', { number: receipt.receipt_number })}</AppText>
                    <AppText variant="small" color="textMuted" align="center">{formatTripDate(receipt.issued_at)}</AppText>
                </View>

                <Card variant="outlined">
                    <AppText variant="label" color="textMuted">{t('receipt.recorrido')}</AppText>
                    <AppText variant="body">{shortPlace(receipt.pickup_description)}</AppText>
                    <AppText variant="body">→ {shortPlace(receipt.destination_description)}</AppText>
                    {receipt.driver && <AppText variant="small" color="textMuted">{t('receipt.conductorNombre', { name: receipt.driver })}</AppText>}
                    {receipt.client && <AppText variant="small" color="textMuted">{t('receipt.clienteNombre', { name: receipt.client })}</AppText>}
                </Card>

                <ReceiptCard
                    title={t('receipt.detalle')}
                    lines={viewModel.lines(receipt)}
                    totalLabel={t('receipt.total')}
                    total={receipt.total}
                    currency={receipt.currency}
                    footnote={viewModel.paymentText(receipt)}
                />

                <AppText variant="caption" color="textMuted">{t('receipt.elImpuestoSeCalculaSobre')}</AppText>
            </ScrollView>

            {afterPayment && other &&
                <View style={styles.footer}>
                    <Button title={t('receipt.calificarA', { name: other.name })} onPress={goToRating} />
                </View>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        justifyContent: 'center',
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    heading: {
        alignItems: 'center',
        gap: spacing.xs,
        paddingTop: spacing.md,
    },
    badge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.asphalt,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
});
