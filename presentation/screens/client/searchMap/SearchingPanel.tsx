import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { ClientSearchMapViewModel } from "./ClientSearchMapViewModel";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverOfferItem } from "./DriverOfferItem";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import CancelReasonModal from "../../../components/CancelReasonModal";
import { CLIENT_CANCEL_REASONS, vehicleLabel } from "../../../utils/Cargo";
import { formatCOP, formatCountdown, formatErrorMessage, formatScheduledDate } from "../../../utils/Formatters";

interface Props {
    viewModel: ClientSearchMapViewModel;
    idClientRequest: number;
    navigation: StackNavigationProp<ClientMapStackParamList, 'ClientSearchMapScreen', undefined>;
    // La búsqueda terminó (cancelada, vencida, aceptada) o el cliente la deja corriendo en "Próximos fletes"
    onClose: () => void;
}

const RAISE_STEPS = [2000, 5000, 10000];
const SEARCH_DURATION_MS = 10 * 60 * 1000;

export default function SearchingPanel({ viewModel, idClientRequest, navigation, onClose }: Props) {
    const [request, setRequest] = useState<ClientRequestResponse | null>(null);
    const [offers, setOffers] = useState<DriverTripOffer[]>([]);
    const [now, setNow] = useState(Date.now());
    const [isExpired, setIsExpired] = useState(false);
    const [isCancelVisible, setIsCancelVisible] = useState(false);
    const [isRaising, setIsRaising] = useState(false);

    const loadRequest = useCallback(async () => {
        const response = await viewModel.getClientRequestById(idClientRequest);
        if ('id' in response) {
            setRequest(response);
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

    // El reloj del teléfono puede ir unos segundos distinto al del servidor: una búsqueda "Ahora" nunca muestra más de 10 minutos
    const remainingMs = request?.expires_at ? Math.min(new Date(request.expires_at).getTime() - now, SEARCH_DURATION_MS) : 0;
    const isScheduled = Boolean(request?.scheduled_at);

    const handleRaise = async (step: number) => {
        if (!request || isRaising) return;
        setIsRaising(true);
        const response = await viewModel.raiseFare(idClientRequest, request.fare_offered + step);
        setIsRaising(false);
        if (response === true) {
            ToastAndroid.show(`Ahora ofreces ${formatCOP(request.fare_offered + step)}`, ToastAndroid.SHORT);
            loadRequest();
        } else {
            ToastAndroid.show(formatErrorMessage((response as ErrorResponse).message), ToastAndroid.LONG);
        }
    }

    const handleCancel = async (reason: string) => {
        setIsCancelVisible(false);
        const response = await viewModel.cancelClientRequest(idClientRequest, reason);
        if (response === true) {
            ToastAndroid.show('Búsqueda cancelada', ToastAndroid.SHORT);
            onClose();
        } else {
            ToastAndroid.show(formatErrorMessage((response as ErrorResponse).message), ToastAndroid.LONG);
        }
    }

    return (
        <Modal visible transparent animationType="slide" onRequestClose={() => isExpired ? onClose() : setIsCancelVisible(true)}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isExpired ? 'La búsqueda venció' : isScheduled ? 'Flete programado' : 'Buscando conductor'}
                        </Text>
                        {!isExpired && request &&
                            <Text style={styles.subtitle}>
                                {isScheduled
                                    ? `Para el ${formatScheduledDate(request.scheduled_at)}. Recibe ofertas hasta el ${formatScheduledDate(request.expires_at)}.`
                                    : `Quedan ${formatCountdown(remainingMs)} · ${vehicleLabel(request.required_vehicle)}`}
                            </Text>
                        }
                    </View>

                    {isExpired
                        ? <View style={styles.center}>
                            <Text style={styles.emptyText}>Ningún conductor aceptó a tiempo. Puedes volver a pedir el flete, quizás con un precio más alto.</Text>
                            <TouchableOpacity style={[styles.mainButton, { backgroundColor: 'black' }]} onPress={onClose}>
                                <Text style={styles.mainButtonText}>Volver a pedir</Text>
                            </TouchableOpacity>
                        </View>
                        : <>
                            <View style={styles.fareBox}>
                                <Text style={styles.fareLabel}>Tu precio</Text>
                                <Text style={styles.fare}>{formatCOP(request?.fare_offered)}</Text>
                                <View style={styles.raiseRow}>
                                    {RAISE_STEPS.map((step) => (
                                        <TouchableOpacity key={step} style={styles.raiseButton} onPress={() => handleRaise(step)} disabled={isRaising}>
                                            <Text style={styles.raiseText}>+{formatCOP(step)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <FlatList
                                data={offers}
                                keyExtractor={(item) => item.id!.toString()}
                                style={{ flex: 1 }}
                                renderItem={({ item }) => (
                                    <DriverOfferItem
                                        viewModel={viewModel}
                                        driverTripOffer={item}
                                        navigation={navigation}
                                        onResolved={(accepted) => accepted ? onClose() : loadOffers()}
                                    />
                                )}
                                ListEmptyComponent={
                                    <View style={styles.center}>
                                        <ActivityIndicator size="large" color="black" />
                                        <Text style={styles.emptyText}>Esperando ofertas de conductores con {vehicleLabel(request?.required_vehicle).toLowerCase()} o más grande...</Text>
                                    </View>
                                }
                            />

                            <View style={styles.footer}>
                                {isScheduled &&
                                    <TouchableOpacity style={[styles.mainButton, { backgroundColor: 'black', marginBottom: 8 }]} onPress={onClose}>
                                        <Text style={styles.mainButtonText}>Ver luego en Próximos fletes</Text>
                                    </TouchableOpacity>
                                }
                                <TouchableOpacity style={[styles.mainButton, { backgroundColor: '#eee' }]} onPress={() => setIsCancelVisible(true)}>
                                    <Text style={[styles.mainButtonText, { color: 'red' }]}>Cancelar búsqueda</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    }
                </View>
            </View>
            <CancelReasonModal
                visible={isCancelVisible}
                title="Cancelar la búsqueda"
                reasons={CLIENT_CANCEL_REASONS}
                onClose={() => setIsCancelVisible(false)}
                onConfirm={handleCancel}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    content: {
        height: '85%',
        backgroundColor: '#f6f6f6',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    header: {
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#444',
        marginTop: 4,
    },
    fareBox: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 14,
    },
    fareLabel: {
        color: 'gray',
    },
    fare: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    raiseRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    raiseButton: {
        flex: 1,
        backgroundColor: '#e8f5e9',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    raiseText: {
        color: 'green',
        fontWeight: 'bold',
    },
    center: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#555',
        marginTop: 12,
        marginBottom: 16,
    },
    footer: {
        paddingTop: 8,
    },
    mainButton: {
        borderRadius: 30,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
    },
    mainButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
