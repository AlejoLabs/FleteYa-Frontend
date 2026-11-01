import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import MapView from "react-native-maps";
import { container } from "../../../../di/container";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";
import { useAuth } from "../../../hooks/useAuth";
import { useUnreadMessages } from "../../../hooks/useUnreadMessages";
import { Button, MapButton, Sheet, StateView } from "../../../components/ui";
import CancelReasonModal from "../../../components/CancelReasonModal";
import { DRIVER_CANCEL_REASONS, floorText } from "../../../utils/Cargo";
import { colors, spacing } from "../../../theme";
import TripMap, { fitPoints } from "../../trip/components/TripMap";
import { useTripRoute } from "../../trip/hooks/useTripRoute";
import { canCancelTrip, isCargoOnBoard, routeTarget, toLatLng } from "../../trip/TripStatus";
import { DriverTripMapViewModel } from "./DriverTripMapViewModel";
import { useDriverTrip } from "./hooks/useDriverTrip";
import { useDriverTracking } from "./hooks/useDriverTracking";
import DriverTripSheet from "./DriverTripSheet";
import DeliveryPanel from "./DeliveryPanel";

// Alto máximo de la hoja: deja arriba casi la mitad del mapa para ver la ruta; el resto se desplaza
const SHEET_MAX = 0.58;

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverTripMapScreen'> { };

// Viaje en curso del conductor: mapa con la ruta que le falta y una hoja con el paso en que va
export function DriverTripMapScreen({ navigation, route }: Props) {
    const { idClientRequest } = route.params;
    const viewModel: DriverTripMapViewModel = container.resolve("driverTripMapViewModel");
    const { authResponse } = useAuth();
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const mapRef = useRef<MapView>(null);
    const [sheetHeight, setSheetHeight] = useState(0);
    const [isCancelVisible, setIsCancelVisible] = useState(false);
    const [isDeliveryVisible, setIsDeliveryVisible] = useState(false);

    const trip = useDriverTrip(viewModel, idClientRequest, {
        onFinished: () => {
            tracking.stop();
            navigation.replace('TripPaymentScreen', { idClientRequest });
        },
        onLeft: () => {
            tracking.stop();
            // reset y no popToTop: si el viaje se abrió desde "Próximos fletes" no hay pantalla anterior en este stack
            navigation.reset({ index: 0, routes: [{ name: 'DriverClientRequestScreen' }] });
        },
    });
    const { request, status } = trip;
    const tracking = useDriverTracking(viewModel, request?.id_client);
    const unread = useUnreadMessages(viewModel, idClientRequest, authResponse?.user.id);
    const { route: tripRoute, loadRoute } = useTripRoute(viewModel);

    // La ruta va de donde está el conductor al punto que toca. Se pide al tener la primera ubicación y al recoger la carga,
    // no con cada movimiento del GPS
    const hasLocation = tracking.location !== null;
    useEffect(() => {
        if (request && tracking.location) loadRoute(tracking.location, routeTarget(request, status));
    }, [request, hasLocation, isCargoOnBoard(status)]);

    const fitTrip = () => {
        if (!request) return;
        const target = routeTarget(request, status);
        fitPoints(mapRef, tripRoute.length > 1 ? tripRoute : tracking.location ? [tracking.location, target] : [target]);
    }
    // Se espera a que la hoja tenga su alto y el mapa su margen
    useEffect(() => {
        const timer = setTimeout(fitTrip, 700);
        return () => clearTimeout(timer);
    }, [request, tripRoute]);

    const handleNext = async () => {
        const openDelivery = await trip.advance();
        if (openDelivery) setIsDeliveryVisible(true);
    }

    const openReport = () => navigation.navigate('IncidentReportScreen', { idClientRequest });

    if (!request) {
        return (
            <View style={[styles.screen, styles.center]}>
                {trip.loadFailed
                    ? <StateView kind="error" message="No pudimos cargar el viaje." onAction={trip.reload} />
                    : <StateView kind="loading" message="Cargando el viaje…" />}
            </View>
        );
    }

    const step = viewModel.nextStep(status);
    const text = viewModel.statusText(status);
    const destinationFloor = floorText(request.destination_floor, request.destination_has_elevator);
    const receiverText = [request.receiver_name ? `Recibe ${request.receiver_name}` : null, destinationFloor].filter(Boolean).join(' · ') || null;

    return (
        <View style={styles.screen}>
            <TripMap
                mapRef={mapRef}
                bottomInset={sheetHeight}
                initialCenter={toLatLng(request.pickup_position)}
                vehicle={tracking.location}
                vehicleTitle="Tú"
                pickup={isCargoOnBoard(status) ? null : toLatLng(request.pickup_position)}
                destination={toLatLng(request.destination_position)}
                route={tripRoute}
            />

            <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
                <MapButton icon="menu" label="Abrir menú" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
                <MapButton icon="scan-outline" label="Ver la ruta completa" onPress={fitTrip} />
            </View>

            <View style={styles.sheetArea} onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}>
                <Sheet
                    scroll
                    maxHeight={windowHeight * SHEET_MAX}
                    footer={
                        <View style={styles.footer}>
                            {step && <Button title={step.label} loading={trip.updating} onPress={handleNext} />}
                            {canCancelTrip(status) && <Button title="Cancelar flete" variant="dangerText" onPress={() => setIsCancelVisible(true)} />}
                        </View>
                    }
                >
                    <DriverTripSheet
                        request={request}
                        status={status}
                        title={text.title}
                        hint={text.hint}
                        unread={unread}
                        locationUnavailable={tracking.unavailable}
                        onChat={() => navigation.navigate('TripChatScreen', { idClientRequest, otherName: request.client.name })}
                        onReport={openReport}
                    />
                </Sheet>
            </View>

            {isDeliveryVisible &&
                <DeliveryPanel
                    destination={request.destination_description}
                    receiverText={receiverText}
                    photos={trip.deliveryPhotos}
                    isSending={trip.updating}
                    error={trip.deliveryError}
                    onTakePhoto={trip.addDeliveryPhoto}
                    onSubmit={trip.deliver}
                    onReport={openReport}
                    onClose={() => setIsDeliveryVisible(false)}
                />
            }

            <CancelReasonModal
                visible={isCancelVisible}
                title="Cancelar el flete"
                reasons={DRIVER_CANCEL_REASONS}
                onClose={() => setIsCancelVisible(false)}
                onConfirm={(reason) => {
                    setIsCancelVisible(false);
                    trip.cancel(reason);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    center: {
        justifyContent: 'center',
    },
    topBar: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sheetArea: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    footer: {
        gap: spacing.xs,
    },
});
