import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { container } from "../../../../di/container";
import { TripSharedParamList } from "../../../navigator/TripSharedParamList";
import { useAuth } from "../../../hooks/useAuth";
import { AppText, Button, ConfirmDialog, Notice, OptionCard, ReceiptCard, StateView } from "../../../components/ui";
import { formatMoney } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";
import { shortPlace } from "../TripStatus";
import { TripPaymentViewModel } from "./TripPaymentViewModel";
import { useTripPayment } from "./useTripPayment";
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<TripSharedParamList, 'TripPaymentScreen'>;

const AUTO_RATING_MS = 1800;

// Pago al entregar la carga: el cliente paga (efectivo o por la app) y el conductor cobra. Después, a calificar
export function TripPaymentScreen({ navigation, route }: Props) {
    const { t } = useTranslation();

    const { idClientRequest } = route.params;
    const viewModel: TripPaymentViewModel = container.resolve('tripPaymentViewModel');
    const { authResponse } = useAuth();
    const userId = authResponse?.user.id;
    const [isCashConfirmVisible, setIsCashConfirmVisible] = useState(false);
    const trip = useTripPayment(viewModel, idClientRequest, (request) => viewModel.roleOf(request, userId) === 'CLIENT');
    const { request, payment, busy } = trip;
    const isClient = request ? viewModel.roleOf(request, userId) === 'CLIENT' : false;

    // Cada stack tiene su propia pantalla de calificación
    const goToRating = () => {
        if (!request) return;
        (navigation as any).replace(isClient ? 'ClientTripRatingScreen' : 'DriverTripRatingScreen', { clientRequest: request });
    }

    // Al volver del pago aprobado, el cliente ve un momento el recibo y pasa solo a calificar al conductor
    useEffect(() => {
        if (!trip.paidNow || !isClient) return;
        const timer = setTimeout(goToRating, AUTO_RATING_MS);
        return () => clearTimeout(timer);
    }, [trip.paidNow, isClient]);

    if (!request || !payment) {
        return (
            <SafeAreaView style={[styles.screen, styles.center]} edges={['top', 'bottom']}>
                {trip.loadFailed
                    ? <StateView kind="error" message={t('tripPayment.noPudimosCargarElPago')} onAction={trip.reload} />
                    : <StateView kind="loading" message={t('tripPayment.cargandoElPago')} />}
            </SafeAreaView>
        );
    }

    const role = viewModel.roleOf(request, userId);
    const isPaid = Boolean(payment.paid_at);
    const receipt = viewModel.receipt(request, payment, role);
    const other = isClient ? request.driver : request.client;

    const handleConfirmCash = async () => {
        const done = await trip.confirmCash();
        if (done) setIsCashConfirmVisible(false);
    }

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.done}>
                    <View style={[styles.badge, isPaid && styles.badgePaid]}>
                        <Ionicons name={isPaid ? 'checkmark' : 'cash-outline'} size={36} color={colors.textOnDark} />
                    </View>
                    <AppText variant="display" align="center" accessibilityRole="header">
                        {isPaid ? t('tripPayment.fletePagado') : isClient ? t('tripPayment.pagaTuFlete') : t('tripPayment.cobraElFlete')}
                    </AppText>
                    <AppText variant="body" color="textMuted" align="center">
                        {shortPlace(request.pickup_description)} → {shortPlace(request.destination_description)}
                    </AppText>
                </View>

                <ReceiptCard {...receipt} />

                {!isPaid && isClient &&
                    <View style={styles.methods}>
                        <AppText variant="label" color="textMuted">{t('tripPayment.comoPagas')}</AppText>
                        <OptionCard
                            title={t('tripPayment.efectivo')}
                            description={t('tripPayment.seLoEntregasAlConductor')}
                            icon="cash-outline"
                            selected={payment.payment_method === 'CASH'}
                            disabled={busy !== null}
                            onPress={() => trip.changeMethod('CASH')}
                        />
                        <OptionCard
                            title={t('tripPayment.porLaApp')}
                            description={payment.online_gateway ? (!payment.currency || payment.currency === 'COP' ? t('tripPayment.nequiTarjetaOPse') : t('tripPayment.conTarjeta')) : t('tripPayment.noDisponibleEnEsteMomento')}
                            icon="phone-portrait-outline"
                            selected={payment.payment_method === 'WOMPI'}
                            disabled={busy !== null || !payment.online_gateway}
                            onPress={() => trip.changeMethod('WOMPI')}
                        />
                    </View>
                }

                {viewModel.wasDeclined(payment) &&
                    <Notice tone="danger" title={t('tripPayment.elPagoNoSeAprobo')} message={isClient ? t('tripPayment.intentaOtraVezOPaga') : t('tripPayment.elClientePuedeIntentarOtra')} />}

                {!isPaid && !viewModel.wasDeclined(payment) &&
                    <View style={styles.pending}>
                        {!isClient && payment.payment_method === 'WOMPI' && <ActivityIndicator color={colors.text} />}
                        <AppText variant="small" color="textMuted" style={styles.flex}>{viewModel.pendingText(payment, role)}</AppText>
                    </View>
                }

                {payment.online_gateway === 'SIMULATOR' && !isPaid && payment.payment_method === 'WOMPI' &&
                    <AppText variant="caption" color="textMuted" align="center">{t('tripPayment.modoDePruebaElPago')}</AppText>}
            </ScrollView>

            <View style={styles.footer}>
                {isPaid && <Button title={t('tripPayment.calificarA', { name: other.name })} onPress={goToRating} />}

                {!isPaid && isClient && payment.payment_method === 'WOMPI' &&
                    <>
                        <Button title={t('tripPayment.pagar', { amount: formatMoney(payment.amount, payment.currency) })} loading={busy === 'online'} disabled={busy !== null && busy !== 'online'} onPress={trip.payOnline} />
                        <Button title={t('tripPayment.yaPagueRevisar')} variant="text" loading={busy === 'verify'} onPress={() => trip.verify()} />
                    </>
                }

                {!isPaid && !isClient && payment.payment_method === 'CASH' &&
                    <Button title={t('tripPayment.recibi', { amount: formatMoney(payment.amount, payment.currency) })} variant="success" onPress={() => setIsCashConfirmVisible(true)} />}

                {/* El conductor no se queda atascado si el cliente no paga ya: el flete sigue pendiente en "En curso" */}
                {!isPaid && !isClient &&
                    <Button title={t('tripPayment.calificarAYEsperarEl', { name: other.name })} variant="text" onPress={goToRating} />}
            </View>

            <ConfirmDialog
                visible={isCashConfirmVisible}
                title={t('tripPayment.recibiste', { amount: formatMoney(payment.amount, payment.currency) })}
                message={t('tripPayment.confirmaloSoloCuandoTengasEl')}
                confirmLabel={t('tripPayment.siLoRecibi')}
                cancelLabel={t('tripPayment.todaviaNo')}
                loading={busy === 'cash'}
                onConfirm={handleConfirmCash}
                onCancel={() => setIsCashConfirmVisible(false)}
            />
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
    done: {
        alignItems: 'center',
        gap: spacing.sm,
        paddingTop: spacing.lg,
    },
    badge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.asphalt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgePaid: {
        backgroundColor: colors.success,
    },
    methods: {
        gap: spacing.sm,
    },
    pending: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    flex: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.xs,
    },
});
