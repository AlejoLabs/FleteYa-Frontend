import { StackScreenProps } from "@react-navigation/stack";
import { Animated, Dimensions, Image, Platform, ScrollView, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";
import { container } from "../../../../di/container";
import { DriverTripMapViewModel } from "./DriverTripMapViewModel";
import { useEffect, useRef, useState } from "react";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import MapView, { Camera, LatLng, Marker, Polyline, Region } from "react-native-maps";
import styles from './Styles';
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { decode } from "@googlemaps/polyline-codec";
import { Status } from "../../../../domain/repository/ClientRequestRepository";
import { formatCOP, formatErrorMessage, getTripFare } from "../../../utils/Formatters";
import TripProgress from "../../../components/TripProgress";
import CargoInfo from "../../../components/CargoInfo";
import CancelReasonModal from "../../../components/CancelReasonModal";
import { DRIVER_CANCEL_REASONS } from "../../../utils/Cargo";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";

// Siguiente paso del viaje para el conductor: llegar al origen, recoger la carga y entregarla
const NEXT_STEP: Partial<Record<Status, { status: Status; label: string }>> = {
    [Status.ACCEPTED]: { status: Status.ARRIVED, label: 'NOTIFICAR LLEGADA' },
    [Status.ON_THE_WAY]: { status: Status.ARRIVED, label: 'NOTIFICAR LLEGADA' },
    [Status.ARRIVED]: { status: Status.TRAVELING, label: 'CARGA RECOGIDA' },
    [Status.TRAVELING]: { status: Status.FINISHED, label: 'FINALIZAR VIAJE' },
};
const CANCELABLE = [Status.ACCEPTED, Status.ON_THE_WAY, Status.ARRIVED];

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverTripMapScreen'> { };
export function DriverTripMapScreen({ navigation, route }: Props) {
    const { idClientRequest } = route.params;
    const viewModel: DriverTripMapViewModel = container.resolve("driverTripMapViewModel");
    const animatedValue = useRef(new Animated.Value(0)).current;
    const mapRef = useRef<MapView>(null);
    const [isInteractingWithMap, setIsInteractingWithMap] = useState<boolean>(false);
    const [location, setLocation] = useState<Region | undefined>(undefined);
    const [clientRequest, setClientRequest] = useState<ClientRequestResponse | null>(null);
    const [tracking, setTracking] = useState<boolean>(true);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const [directionsRoute, setDirectionsRoute] = useState<LatLng[]>([]);
    const [currentStatus, setCurrentStatus] = useState(Status.ACCEPTED);
    const [isCancelVisible, setIsCancelVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleGetClientRequestById = async () => {
        const response = await viewModel.getClientRequestById(idClientRequest);
        if ('id' in response) {
            setClientRequest(response);
            // Si el conductor vuelve al viaje desde "Próximos fletes", sigue en el paso en que iba
            setCurrentStatus(response.status as Status);
        }
    }

    const handleNextStep = async () => {
        const next = NEXT_STEP[currentStatus];
        if (!next || isUpdating) return;
        setIsUpdating(true);
        const response = await viewModel.updateStatus(idClientRequest, next.status);
        setIsUpdating(false);
        if (typeof response !== 'boolean') {
            ToastAndroid.show(formatErrorMessage((response as ErrorResponse).message), ToastAndroid.LONG);
            return;
        }
        setCurrentStatus(next.status);
        viewModel.emitUpdateStatus(idClientRequest, next.status);
        if (next.status === Status.TRAVELING) {
            ToastAndroid.show('Carga recogida: ruta al destino', ToastAndroid.SHORT);
            handleGetDirections(
                { latitude: location!.latitude, longitude: location!.longitude },
                { latitude: clientRequest!.destination_position.y, longitude: clientRequest!.destination_position.x }
            );
        } else if (next.status === Status.FINISHED) {
            navigation.replace('DriverTripRatingScreen', { clientRequest: clientRequest! });
        } else {
            ToastAndroid.show('Estado actualizado', ToastAndroid.SHORT);
        }
    }

    const leaveTrip = () => {
        stopRealTimeLocation();
        // reset y no popToTop: si el viaje se abrió desde "Próximos fletes" no hay pantalla anterior en este stack
        navigation.reset({ index: 0, routes: [{ name: 'DriverClientRequestScreen' }] });
    }

    const handleCancel = async (reason: string) => {
        setIsCancelVisible(false);
        const response = await viewModel.cancelTrip(idClientRequest, reason);
        if (response === true) {
            ToastAndroid.show('Viaje cancelado', ToastAndroid.SHORT);
            leaveTrip();
        } else {
            ToastAndroid.show(formatErrorMessage((response as ErrorResponse).message), ToastAndroid.LONG);
        }
    }

    useEffect(() => {
        const off = viewModel.listenerTripCanceled(idClientRequest, (reason) => {
            ToastAndroid.show(`El cliente canceló el viaje${reason ? `: ${reason}` : ''}`, ToastAndroid.LONG);
            leaveTrip();
        });
        return off;
    }, [idClientRequest]);

    const moveCameraToLocation = (lat: number, lng: number) => {
        const camera: Camera = {
            center: {
                latitude: lat,
                longitude: lng,
            },
            pitch: 0,
            heading: 0,
            zoom: 15,
        };
        mapRef.current?.animateCamera(camera, { duration: 1000 });
    }

    const handleGetDirections = async (origin: LatLng, destination: LatLng) => {
        const response: GoogleDirections | null = await viewModel.getDirections(origin, destination);
        if (response !== null) {
            if (response.routes.length > 0) {
                const points = response.routes[0].overview_polyline.points;
                const coordinates = decode(points).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
                setDirectionsRoute(coordinates);
            }
        }
    }

    useEffect(() => {
        handleGetClientRequestById();
        // Al terminar el viaje la pantalla se reemplaza: el GPS debe dejar de enviar la posición al cliente
        return () => {
            locationSubscription.current?.remove();
            locationSubscription.current = null;
        };
    }, []);

    useEffect(() => {
        if (clientRequest !== null) {
            (async () => {
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        console.log('Permiso de ubicacion denegado');
                        return;
                    }

                    if (Platform.OS === 'android') {
                        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
                        if (backgroundStatus.status !== 'granted') {
                            console.log('Permiso de ubicacion en segundo plano denegado');
                        }
                    }
                    let location = await Location.getCurrentPositionAsync({});
                    const currentCoords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    };
                    setLocation(currentCoords);
                    moveCameraToLocation(location.coords.latitude, location.coords.longitude);
                    // Con la carga a bordo la ruta va al destino; antes, al punto de recogida
                    const target = clientRequest.status === Status.TRAVELING ? clientRequest.destination_position : clientRequest.pickup_position;
                    handleGetDirections(
                        {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        },
                        {
                            latitude: target.y,
                            longitude: target.x,

                        }
                    );

                    if (tracking) {
                        startRealTimeLocation();
                    }
                    else {
                        stopRealTimeLocation();
                    }


                } catch (error) {
                    console.log('No se pudo obtener la ubicacion actual', error);
                }
            })();
        }

    }, [clientRequest, tracking]);

    const startRealTimeLocation = async () => {
        if (!locationSubscription.current) {

            // Durante el viaje el cliente sigue al conductor en el mapa: cada 3 s o 5 m se ve fluido sin saturar el teléfono
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 3000,
                    distanceInterval: 5
                },
                (newLocation) => {
                    const currentCoords = {
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                    };

                    setLocation({
                        latitude: currentCoords.latitude,
                        longitude: currentCoords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });

                    viewModel.emitDriverPosition(
                        clientRequest?.id_client!,
                        newLocation.coords.latitude,
                        newLocation.coords.longitude
                    );
                }

            );
        }

        viewModel.initSocket();
    }

    const stopRealTimeLocation = () => {
        if (locationSubscription.current) {
            viewModel.discconectSocket();
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    }

    if (!clientRequest || !location) {
        return (
            <View style={styles.container}>
                <Text>Cargando...</Text>
            </View>
        );
    }

    const toggleView = (isInteractingWithMap: boolean) => {
        setIsInteractingWithMap(isInteractingWithMap);
        Animated.timing(animatedValue, {
            toValue: isInteractingWithMap ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    transform: [
                        { scaleY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }) },
                        { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) }
                    ],
                    width: "100%",
                    position: "absolute",
                    top: 0
                }}
            >
                <MapView
                    ref={mapRef}
                    style={{
                        width: "100%",
                        height: isInteractingWithMap ? Dimensions.get("window").height * 0.87 : Dimensions.get("window").height * 0.66,
                    }}
                    initialRegion={location}
                    zoomControlEnabled={true}
                    mapPadding={{ bottom: isInteractingWithMap ? 140 : 170, top: 0, left: 0, right: 0 }}
                    region={location}
                    onRegionChangeComplete={(region) => {
                        toggleView(false);
                    }}
                    onPanDrag={() => toggleView(true)}
                >
                    {
                        location !== null && (
                            <Marker
                                coordinate={{
                                    latitude: location?.latitude!,
                                    longitude: location?.longitude!,
                                }}
                                title="Mi Posición"
                            >
                                <View style={{ width: 50, height: 50 }}>
                                    <Image
                                        source={require("../../../../assets/icon_taxi.png")}
                                        style={{ resizeMode: "contain", width: "50%", height: "50%" }}
                                    />
                                </View>
                            </Marker>
                        )
                    }
                    {
                        (clientRequest !== null && currentStatus !== Status.TRAVELING) && (
                            <Marker
                                coordinate={{
                                    latitude: clientRequest.pickup_position.y,
                                    longitude: clientRequest.pickup_position.x
                                }}
                                title="Origen"
                            >
                                <View style={{ width: 50, height: 50 }}>
                                    <Image
                                        source={require("../../../../assets/pin_map.png")}
                                        style={{ resizeMode: "contain", width: "50%", height: "50%" }}
                                    />
                                </View>
                            </Marker>
                        )
                    }
                    {
                        (clientRequest !== null && currentStatus === Status.TRAVELING) && (
                            <Marker
                                coordinate={{
                                    latitude: clientRequest.destination_position.y,
                                    longitude: clientRequest.destination_position.x
                                }}
                                title="Destino"
                            >
                                <View style={{ width: 50, height: 50 }}>
                                    <Image
                                        source={require("../../../../assets/flag.png")}
                                        style={{ resizeMode: "contain", width: "50%", height: "50%" }}
                                    />
                                </View>
                            </Marker>
                        )
                    }
                    {
                        directionsRoute.length > 0 && (<Polyline coordinates={directionsRoute} strokeWidth={6} strokeColor="#6200EE" />)
                    }

                </MapView>
            </Animated.View>

            <Animated.View
                style={{
                    transform: [
                        { scaleY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }) },
                        { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 280] }) }
                    ],
                    width: "100%",
                    position: "absolute",
                    height: "46%",
                    bottom: 0,
                    backgroundColor: "white",
                    paddingTop: 10,
                    paddingHorizontal: 10,
                    paddingBottom: 14,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                }}
            >

                <ScrollView
                    style={{ width: "100%" }}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    showsVerticalScrollIndicator={false}
                >

                    <TripProgress status={currentStatus} />

                    <Text style={styles.textTitle}>TU CLIENTE</Text>
                    <View style={styles.rowContainer}>
                        <View style={styles.dataContainer}>
                            <Text>{clientRequest?.client.name} {clientRequest?.client.lastname}</Text>
                            <Text>Cel: {clientRequest?.client.phone}</Text>
                        </View>
                        <Image
                            source={{ uri: clientRequest?.client.image }}
                            style={styles.userImage}
                        />
                    </View>

                    <Text style={styles.textTitle}>DATOS DEL VIAJE</Text>
                    <View style={styles.rowContainer}>
                        <Ionicons
                            name="location"
                            size={20}
                            color="black"
                        />
                        <View style={styles.tripContainer}>
                            <Text>Desde: {clientRequest?.pickup_description}</Text>
                            <Text>Hasta: {clientRequest?.destination_description}</Text>
                            <CargoInfo request={clientRequest} showContacts />
                        </View>
                    </View>

                    <View style={styles.rowContainer}>
                        <Ionicons
                            name="pricetag"
                            size={20}
                            color="black"
                        />
                        <View style={styles.tripContainer}>
                            <Text>Valor del viaje</Text>
                            <Text style={styles.textPrice}>
                                {clientRequest && formatCOP(getTripFare(clientRequest))}
                            </Text>
                        </View>
                    </View>

                    {NEXT_STEP[currentStatus] &&
                        <TouchableOpacity style={styles.iconContainer} onPress={handleNextStep}>
                            <View style={styles.iconBox}>
                                <Ionicons name='checkmark' size={25} color='white' />
                            </View>
                            <Text style={styles.textAction}>
                                {isUpdating ? 'GUARDANDO...' : NEXT_STEP[currentStatus]!.label}
                            </Text>
                        </TouchableOpacity>
                    }

                    {CANCELABLE.includes(currentStatus) &&
                        <TouchableOpacity style={{ alignSelf: 'center', padding: 12 }} onPress={() => setIsCancelVisible(true)}>
                            <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancelar viaje</Text>
                        </TouchableOpacity>
                    }

                </ScrollView>
            </Animated.View>
            <CancelReasonModal
                visible={isCancelVisible}
                title="Cancelar el viaje"
                reasons={DRIVER_CANCEL_REASONS}
                onClose={() => setIsCancelVisible(false)}
                onConfirm={handleCancel}
            />
        </View>
    )
}