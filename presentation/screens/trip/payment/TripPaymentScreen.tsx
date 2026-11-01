import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { container } from "../../../../di/container";
import { TripSharedParamList } from "../../../navigator/TripSharedParamList";
import { useAuth } from "../../../hooks/useAuth";
import { AppText, Button, ConfirmDialog, Notice, OptionCard, ReceiptCard, StateView } from "../../../components/ui";
import { formatCOP } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";
import { shortPlace } from "../TripStatus";
import { TripPaymentViewModel } from "./TripPaymentViewModel";
import { useTripPayment } from "./useTripPayment";

type Props = NativeStackScreenProps<TripSharedParamList, 'TripPaymentScreen'>;

// Pago al entregar la carga: el cliente paga (efectivo o por la app) y el conductor cobra. Después, a calificar
export function TripPaymentScreen({ navigation, route }: Props) {

    const { idClientRequest } = route.params;
    const viewModel: TripPaymentViewModel = container.resolve('tripPaymentViewModel');
    const { authResponse } = useAuth();
    const userId = authResponse?.user.id;
    const [isCashConfirmVisible, setIsCashConfirmVisible] = useState(false);
    const trip = useTripPayment(viewModel, idClientRequest, (request) => viewModel.roleOf(request, userId) === 'CLIENT');
    const { request, payment, busy } = trip;

    if (!request || !payment) {
        return (
            <SafeAreaView style={[styles.screen, styles.center]} edges={['top', 'bottom']}>
                {trip.loadFailed
                    ? <StateView kind="error" message="No pudimos cargar el pago del flete." onAction={trip.reload} />
                    : <StateView kind="loading" message="Cargando el pago…" />}
            </SafeAreaView>
        );
    }

    const role = viewModel.roleOf(request, userId);
    const isClient = role === 'CLIENT';
    const isPaid = Boolean(payment.paid_at);
    const receipt = viewModel.receipt(request, payment, role);
    const other = isClient ? request.driver : request.client;

    // Cada stack tiene su propia pantalla de calificación
    const goToRating = () => (navigation as any).replace(isClient ? 'ClientTripRatingScreen' : 'DriverTripRatingScreen', { clientRequest: request });

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
                        {isPaid ? 'Flete pagado' : isClient ? 'Paga tu flete' : 'Cobra el flete'}
                    </AppText>
                    <AppText variant="body" color="textMuted" align="center">
                        {shortPlace(request.pickup_description)} → {shortPlace(request.destination_description)}
                    </AppText>
                </View>

                <ReceiptCard {...receipt} />

                {!isPaid && isClient &&
                    <View style={styles.methods}>
                        <AppText variant="label" color="textMuted">Cómo pagas</AppText>
                        <OptionCard
                            title="Efectivo"
                            description="Se lo entregas al conductor"
                            icon="cash-outline"
                            selected={payment.payment_method === 'CASH'}
                            disabled={busy !== null}
                            onPress={() => trip.changeMethod('CASH')}
                        />
                        <OptionCard
                            title="Por la app"
                            description={payment.online_gateway ? 'Nequi, tarjeta o PSE' : 'No disponible en este momento'}
                            icon="phone-portrait-outline"
                            selected={payment.payment_method === 'WOMPI'}
                            disabled={busy !== null || !payment.online_gateway}
                            onPress={() => trip.changeMethod('WOMPI')}
                        />
                    </View>
                }

                {viewModel.wasDeclined(payment) &&
                    <Notice tone="danger" title="El pago no se aprobó" message={isClient ? 'Intenta otra vez o paga en efectivo.' : 'El cliente puede intentar otra vez o pagarte en efectivo.'} />}

                {!isPaid && !viewModel.wasDeclined(payment) &&
                    <View style={styles.pending}>
                        {!isClient && payment.payment_method === 'WOMPI' && <ActivityIndicator color={colors.text} />}
                        <AppText variant="small" color="textMuted" style={styles.flex}>{viewModel.pendingText(payment, role)}</AppText>
                    </View>
                }

                {payment.online_gateway === 'SIMULATOR' && !isPaid && payment.payment_method === 'WOMPI' &&
                    <AppText variant="caption" color="textMuted" align="center">Modo de prueba: el pago se hace en el simulador y no se cobra dinero real.</AppText>}
            </ScrollView>

            <View style={styles.footer}>
                {isPaid && <Button title={`Calificar a ${other.name}`} onPress={goToRating} />}

                {!isPaid && isClient && payment.payment_method === 'WOMPI' &&
                    <>
                        <Button title={`Pagar ${formatCOP(payment.amount)}`} loading={busy === 'online'} disabled={busy !== null && busy !== 'online'} onPress={trip.payOnline} />
                        <Button title="Ya pagué, revisar" variant="text" loading={busy === 'verify'} onPress={() => trip.verify()} />
                    </>
                }

                {!isPaid && !isClient && payment.payment_method === 'CASH' &&
                    <Button title={`Recibí ${formatCOP(payment.amount)}`} variant="success" onPress={() => setIsCashConfirmVisible(true)} />}

                {/* El conductor no se queda atascado si el cliente no paga ya: el flete sigue pendiente en "En curso" */}
                {!isPaid && !isClient &&
                    <Button title={`Calificar a ${other.name} y esperar el pago`} variant="text" onPress={goToRating} />}
            </View>

            <ConfirmDialog
                visible={isCashConfirmVisible}
                title={`¿Recibiste ${formatCOP(payment.amount)}?`}
                message="Confírmalo solo cuando tengas el efectivo en la mano. El flete queda como pagado."
                confirmLabel="Sí, lo recibí"
                cancelLabel="Todavía no"
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
