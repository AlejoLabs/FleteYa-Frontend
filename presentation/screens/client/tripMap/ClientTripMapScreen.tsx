import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import MapView from "react-native-maps";
import { container } from "../../../../di/container";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { useAuth } from "../../../hooks/useAuth";
import { useUnreadMessages } from "../../../hooks/useUnreadMessages";
import { Button, ConfirmDialog, MapButton, Sheet, StateView } from "../../../components/ui";
import CancelReasonModal from "../../../components/CancelReasonModal";
import { CLIENT_CANCEL_REASONS } from "../../../utils/Cargo";
import { colors, spacing } from "../../../theme";
import { Status } from "../../../../domain/repository/ClientRequestRepository";
import TripMap, { fitPoints } from "../../trip/components/TripMap";
import { useTripRoute } from "../../trip/hooks/useTripRoute";
import { canCancelTrip, isCargoOnBoard, routeTarget, toLatLng } from "../../trip/TripStatus";
import { ClientTripMapViewModel } from "./ClientTripMapViewModel";
import { useClientTrip } from "./hooks/useClientTrip";
import ClientTripSheet from "./ClientTripSheet";

// Alto máximo de la hoja: deja arriba casi la mitad del mapa para ver al conductor; el resto se desplaza
const SHEET_MAX = 0.58;

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientTripMapScreen'> { };

// Viaje en curso del cliente: el conductor moviéndose en el mapa y una hoja con lo que está pasando
export function ClientTripMapScreen({ navigation, route }: Props) {
    const { idClientRequest, idDriver } = route.params;
    const viewModel: ClientTripMapViewModel = container.resolve("clientTripMapViewModel");
    const { authResponse } = useAuth();
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const mapRef = useRef<MapView>(null);
    const [sheetHeight, setSheetHeight] = useState(0);
    const [isCancelVisible, setIsCancelVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const trip = useClientTrip(viewModel, idClientRequest, idDriver, {
        onFinished: () => navigation.replace('TripPaymentScreen', { idClientRequest }),
        // reset: si el viaje se abrió desde "Próximos fletes" no hay pantalla anterior en este stack
        onLeft: () => navigation.reset({ index: 0, routes: [{ name: 'ClientSearchMapScreen' }] }),
    });
    const { request, status, driverPosition } = trip;
    const unread = useUnreadMessages(viewModel, idClientRequest, authResponse?.user.id);
    const { route: tripRoute, etaMinutes, loadRoute } = useTripRoute(viewModel);

    // La ruta va del conductor al punto que toca: se pide con su primera posición y al recoger la carga,
    // no con cada movimiento
    const hasDriver = driverPosition !== null;
    useEffect(() => {
        if (request && driverPosition) loadRoute(driverPosition, routeTarget(request, status));
    }, [request, hasDriver, isCargoOnBoard(status)]);

    // Sin la posición del conductor se encuadran la recogida y el destino
    const fitTrip = () => {
        if (!request) return;
        fitPoints(mapRef, tripRoute.length > 1 ? tripRoute : [toLatLng(request.pickup_position), toLatLng(request.destination_position)]);
    }
    // Se espera a que la hoja tenga su alto y el mapa su margen
    useEffect(() => {
        const timer = setTimeout(fitTrip, 700);
        return () => clearTimeout(timer);
    }, [request, tripRoute]);

    const handleConfirmDelivery = async () => {
        const done = await trip.confirmDelivery();
        if (done) setIsConfirmVisible(false);
    }

    if (!request) {
        return (
            <View style={[styles.screen, styles.center]}>
                {trip.loadFailed
                    ? <StateView kind="error" message="No pudimos cargar el viaje." onAction={trip.reload} />
                    : <StateView kind="loading" message="Cargando el viaje…" />}
            </View>
        );
    }

    const text = viewModel.statusText(status, etaMinutes);

    return (
        <View style={styles.screen}>
            <TripMap
                mapRef={mapRef}
                bottomInset={sheetHeight}
                initialCenter={toLatLng(request.pickup_position)}
                vehicle={driverPosition}
                vehicleTitle="Tu conductor"
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
                    footer={(status === Status.TRAVELING || canCancelTrip(status)) &&
                        <View style={styles.footer}>
                            {status === Status.TRAVELING && <Button title="Ya recibí la carga" variant="success" onPress={() => setIsConfirmVisible(true)} />}
                            {canCancelTrip(status) && <Button title="Cancelar flete" variant="dangerText" onPress={() => setIsCancelVisible(true)} />}
                        </View>
                    }
                >
                    <ClientTripSheet
                        request={request}
                        status={status}
                        title={text.title}
                        hint={text.hint}
                        vehicleText={viewModel.vehicleText(trip.carInfo)}
                        photos={trip.photos}
                        unread={unread}
                        onChat={() => navigation.navigate('TripChatScreen', { idClientRequest, otherName: request.driver.name })}
                        onReport={() => navigation.navigate('IncidentReportScreen', { idClientRequest })}
                    />
                </Sheet>
            </View>

            <ConfirmDialog
                visible={isConfirmVisible}
                title="¿Ya recibiste la carga?"
                message="El viaje se cerrará como entregado. Úsalo si recibiste tú o si el conductor no pudo usar el código."
                confirmLabel="Sí, la recibí"
                cancelLabel="Todavía no"
                loading={trip.confirming}
                onConfirm={handleConfirmDelivery}
                onCancel={() => setIsConfirmVisible(false)}
            />
            <CancelReasonModal
                visible={isCancelVisible}
                title="Cancelar el flete"
                reasons={CLIENT_CANCEL_REASONS}
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
