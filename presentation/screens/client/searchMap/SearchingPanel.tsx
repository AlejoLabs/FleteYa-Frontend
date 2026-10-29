import { useCallback, useEffect, useState } from "react";
import { BackHandler, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { ClientSearchMapViewModel } from "./ClientSearchMapViewModel";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { DriverOfferItem } from "./DriverOfferItem";
import CancelReasonModal from "../../../components/CancelReasonModal";
import { AppText, Button, PriceStepper, StateView, useToast } from "../../../components/ui";
import { colors, radius, spacing } from "../../../theme";
import { CLIENT_CANCEL_REASONS, cargoCategoryLabel, vehicleLabel } from "../../../utils/Cargo";
import { formatCOP, formatCountdown, formatErrorMessage, formatScheduledDate } from "../../../utils/Formatters";
import { FARE_STEP, shortAddress } from "./RequestDraft";

interface Props {
    viewModel: ClientSearchMapViewModel;
    idClientRequest: number;
    navigation: StackNavigationProp<ClientMapStackParamList, 'ClientSearchMapScreen', undefined>;
    // La búsqueda terminó (cancelada, vencida, aceptada) o el cliente la deja corriendo en "Próximos fletes"
    onClose: () => void;
}

const SEARCH_DURATION_MS = 10 * 60 * 1000;

// Ofertas para el flete publicado: se comparan, se aceptan o rechazan, y se puede subir el precio mientras tanto
export default function SearchingPanel({ viewModel, idClientRequest, navigation, onClose }: Props) {
    const { showToast } = useToast();
    const [request, setRequest] = useState<ClientRequestResponse | null>(null);
    const [offers, setOffers] = useState<DriverTripOffer[]>([]);
    const [now, setNow] = useState(Date.now());
    const [isExpired, setIsExpired] = useState(false);
    const [isCancelVisible, setIsCancelVisible] = useState(false);
    const [isRaising, setIsRaising] = useState(false);
    const [newFare, setNewFare] = useState(0);
    // Fin de la búsqueda en el reloj del teléfono. El del teléfono puede ir adelantado o atrasado frente al
    // del servidor: se toma lo que falta al recibir la solicitud (máximo 10 minutos) y se cuenta desde ahí
    const [deadline, setDeadline] = useState<number | null>(null);

    const loadRequest = useCallback(async () => {
        const response = await viewModel.getClientRequestById(idClientRequest);
        if ('id' in response) {
            setRequest(response);
            if (response.expires_at) {
                const left = Math.min(new Date(response.expires_at).getTime() - Date.now(), SEARCH_DURATION_MS);
                setDeadline(Date.now() + Math.max(0, left));
            }
            setNewFare(response.fare_offered + FARE_STEP);
            if (response.status !== 'CREATED') setIsExpired(response.status === 'EXPIRED');
        }
    }, [idClientRequest]);

    const loadOffers = useCallback(async () => {
        const response = await viewModel.getDriverTripOffers(idClientRequest);
        if (Array.isArray(response)) setOffers(response);
    }, [idClientRequest]);

    useEffect(() => {
        loadRequest();
        loadOffers();
        const offOffer = viewModel.listenerNewDriverOffer(idClientRequest, () => loadOffers());
        const offExpired = viewModel.listenerClientRequestExpired(idClientRequest, () => {
            setIsExpired(true);
            setOffers([]);
        });
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => {
            offOffer();
            offExpired();
            clearInterval(timer);
        };
    }, [idClientRequest]);

    // Atrás del teléfono: con la búsqueda viva pregunta si cancelar; vencida, cierra
    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isExpired) onClose();
            else setIsCancelVisible(true);
            return true;
        });
        return () => subscription.remove();
    }, [isExpired]);

    const remainingMs = deadline ? Math.max(0, deadline - now) : 0;
    const isScheduled = Boolean(request?.scheduled_at);
    const currentFare = request?.fare_offered ?? 0;

    const handleRaise = async () => {
        if (!request || isRaising || newFare <= currentFare) return;
        setIsRaising(true);
        const response = await viewModel.raiseFare(idClientRequest, newFare);
        setIsRaising(false);
        if (response === true) {
            showToast(`Ahora ofreces ${formatCOP(newFare)}`, 'success');
            loadRequest();
        } else {
            showToast(formatErrorMessage((response as ErrorResponse).message), 'error');
        }
    }

    const handleCancel = async (reason: string) => {
        setIsCancelVisible(false);
        const response = await viewModel.cancelClientRequest(idClientRequest, reason);
        if (response === true) {
            showToast('Búsqueda cancelada', 'info');
            onClose();
        } else {
            showToast(formatErrorMessage((response as ErrorResponse).message), 'error');
        }
    }

    const title = isExpired ? 'La búsqueda venció' : isScheduled ? 'Flete programado' : 'Ofertas para tu flete';
    const summary = request
        ? [
            cargoCategoryLabel(request.cargo_category),
            `${shortAddress(request.pickup_description)} → ${shortAddress(request.destination_description)}`,
        ].join(' · ')
        : '';

    return (
        // Capa y no Modal: un Modal abre otra ventana y taparía los avisos de la app ("Ahora ofreces…")
        <View style={styles.overlay}>
            <SafeAreaView style={styles.screen}>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <AppText variant="title" style={styles.flex} accessibilityRole="header">{title}</AppText>
                        {!isExpired && !isScheduled && request &&
                            <AppText variant="price" accessibilityLabel={`Quedan ${formatCountdown(remainingMs)} minutos`}>{formatCountdown(remainingMs)}</AppText>}
                    </View>
                    {!isExpired && !isScheduled &&
                        <View style={styles.timeTrack}>
                            <View style={[styles.timeFill, { width: `${(remainingMs / SEARCH_DURATION_MS) * 100}%` }]} />
                        </View>
                    }
                    {request &&
                        <AppText variant="small" color="textMuted" numberOfLines={2}>
                            {isScheduled && !isExpired
                                ? `${summary}. Para el ${formatScheduledDate(request.scheduled_at)}; recibe ofertas hasta el ${formatScheduledDate(request.expires_at)}.`
                                : summary}
                        </AppText>
                    }
                </View>

                {isExpired
                    ? <StateView
                        kind="empty"
                        icon="time-outline"
                        title="Ningún conductor aceptó a tiempo"
                        message="Puedes volver a pedir el flete, quizás con un precio más alto."
                        actionLabel="Volver a pedir"
                        onAction={onClose}
                    />
                    // Hasta que llega la solicitud no se muestra el precio: saldría "$ 0" y "Subir a $ 0"
                    : !request ? <StateView kind="loading" message="Cargando tu flete…" />
                    : <>
                        <FlatList
                            data={offers}
                            keyExtractor={(item) => item.id!.toString()}
                            contentContainerStyle={styles.list}
                            renderItem={({ item }) => (
                                <DriverOfferItem
                                    viewModel={viewModel}
                                    driverTripOffer={item}
                                    navigation={navigation}
                                    onResolved={(accepted) => accepted ? onClose() : loadOffers()}
                                />
                            )}
                            ListEmptyComponent={
                                <StateView
                                    kind="loading"
                                    message={`Esperando ofertas de conductores con ${vehicleLabel(request?.required_vehicle).toLowerCase()} o uno más grande…`}
                                />
                            }
                        />

                        <View style={styles.footer}>
                            <View style={styles.fareRow}>
                                <AppText variant="label" color="textMuted">Tu precio</AppText>
                                <AppText variant="small" color="textMuted">Ahora ofreces {formatCOP(currentFare)}</AppText>
                            </View>
                            <PriceStepper value={newFare} step={FARE_STEP} min={currentFare + FARE_STEP} onChange={setNewFare} />
                            <Button
                                title={`Subir a ${formatCOP(newFare)}`}
                                variant="dark"
                                icon="trending-up"
                                loading={isRaising}
                                disabled={!request || newFare <= currentFare}
                                onPress={handleRaise}
                            />
                            {isScheduled && <Button title="Ver luego en Próximos fletes" variant="secondary" onPress={onClose} />}
                            <Button title="Cancelar búsqueda" variant="dangerText" onPress={() => setIsCancelVisible(true)} />
                        </View>
                    </>
                }
            </SafeAreaView>
            <CancelReasonModal
                visible={isCancelVisible}
                title="Cancelar la búsqueda"
                reasons={CLIENT_CANCEL_REASONS}
                onClose={() => setIsCancelVisible(false)}
                onConfirm={handleCancel}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    flex: {
        flex: 1,
    },
    header: {
        gap: spacing.sm,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    timeTrack: {
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.surfaceMuted,
        overflow: 'hidden',
    },
    timeFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: colors.cargo,
    },
    list: {
        flexGrow: 1,
        gap: spacing.md,
        padding: spacing.lg,
    },
    footer: {
        gap: spacing.sm,
        padding: spacing.lg,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        backgroundColor: colors.surface,
    },
    fareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
