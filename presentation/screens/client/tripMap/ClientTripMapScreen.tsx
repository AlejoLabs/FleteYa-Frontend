import { View, Image, Animated, Dimensions, Text, TouchableOpacity, ToastAndroid, ScrollView, Alert } from "react-native"
import { StackScreenProps } from "@react-navigation/stack";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { container } from "../../../../di/container";
import { ClientTripMapViewModel } from "./ClientTripMapViewModel";
import { use, useEffect, useRef, useState } from "react";
import MapView, { LatLng, Marker, Polyline, Region } from "react-native-maps";
import styles from './Styles'
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/useAuth";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { decode } from "@googlemaps/polyline-codec";
import { Status } from "../../../../domain/repository/ClientRequestRepository";
import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { formatCOP, formatErrorMessage, getTripFare } from "../../../utils/Formatters";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import TripProgress from "../../../components/TripProgress";
import CargoInfo from "../../../components/CargoInfo";
import CancelReasonModal from "../../../components/CancelReasonModal";
import { CLIENT_CANCEL_REASONS, DRIVER_STATUS_LABELS } from "../../../utils/Cargo";
import { Photo } from "../../../../domain/models/Photo";
import DeliveryProofSection from "./DeliveryProofSection";

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientTripMapScreen'> { };
export function ClientTripMapScreen({ navigation, route }: Props) {

    const { authResponse } = useAuth();
    const { idClientRequest, idDriver } = route.params;
    const viewModel: ClientTripMapViewModel = container.resolve("clientTripMapViewModel");
    const animatedValue = useRef(new Animated.Value(0)).current;
    const mapRef = useRef<MapView>(null);
    const [isInteractingWithMap, setIsInteractingWithMap] = useState<boolean>(false);
    const [location, setLocation] = useState<Region | undefined>(undefined);
    const [clientRequest, setClientRequest] = useState<ClientRequestResponse>();
    const [directionsRoute, setDirectionsRoute] = useState<LatLng[]>([]);
    const [driverPosition, setDriverPosition] = useState<LatLng | null>(null);
    const [isDriverPositionSet, setIsDriverPositionSet] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(Status.ACCEPTED);
    const [carInfo, setCarInfo] = useState<DriverCarInfo | null>(null);
    const [etaMinutesFromRoute, setEtaMinutesFromRoute] = useState<number | null>(null);
    const socketListeners = useRef<(() => void)[]>([]);
    const [isCancelVisible, setIsCancelVisible] = useState(false);
    const [tripPhotos, setTripPhotos] = useState<Photo[]>([]);

    const loadTripPhotos = async () => {
        const response = await viewModel.getTripPhotos(idClientRequest);
        if (Array.isArray(response)) setTripPhotos(response);
    }

    // Para cuando el cliente mismo recibe la carga o el conductor agotó los intentos del código
    const handleConfirmDelivery = () => {
        Alert.alert('¿Ya recibiste la carga?', 'Se cerrará el viaje como entregado.', [
            { text: 'Todavía no', style: 'cancel' },
            {
                text: 'Sí, la recibí', onPress: async () => {
                    const response = await viewModel.confirmDelivery(idClientRequest);
                    if (response === true) {
                        setCurrentStatus(Status.FINISHED);
                    } else {
                        ToastAndroid.show(formatErrorMessage((response as ErrorResponse).message), ToastAndroid.LONG);
                    }
                }
            },
        ]);
    }

    const leaveTrip = () => {
        // reset: si el viaje se abrió desde "Próximos fletes" no hay pantalla anterior en este stack
        navigation.reset({ index: 0, routes: [{ name: 'ClientSearchMapScreen' }] });
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
        viewModel.initSocket();
        handleGetClientRequestById();
        const offCanceled = viewModel.listenerTripCanceled(idClientRequest, (reason) => {
            ToastAndroid.show(`El conductor canceló el viaje${reason ? `: ${reason}` : ''}`, ToastAndroid.LONG);
            leaveTrip();
        });
        const offPhoto = viewModel.listenerTripPhoto(idClientRequest, loadTripPhotos);
        socketListeners.current.push(offCanceled, offPhoto);
        loadTripPhotos();
        return () => {
            socketListeners.current.forEach((off) => off());
            socketListeners.current = [];
        };
    }, []);

    useEffect(() => {
        if (isDriverPositionSet === true) {
            handleGetDirections(
                {
                    latitude: driverPosition!.latitude,
                    longitude: driverPosition!.longitude
                },
                {
                    latitude: clientRequest?.pickup_position.y!,
                    longitude: clientRequest?.pickup_position.x!
                }
            );
        }
    }, [isDriverPositionSet]);

    useEffect(() => {
        if(currentStatus === Status.TRAVELING && driverPosition !== null && clientRequest){
            handleGetDirections(
                {
                    latitude: driverPosition!.latitude,
                    longitude: driverPosition!.longitude
                },
                {
                    latitude: clientRequest?.destination_position.y!,
                    longitude: clientRequest?.destination_position.x!
                }
            );
        }
        else if(currentStatus === Status.FINISHED){
            navigation.replace('ClientTripRatingScreen', { clientRequest: clientRequest! });
        }
    }, [currentStatus]);

    useEffect(() => {
        if (driverPosition !== null) {
            setIsDriverPositionSet(true);
        }
    }, [driverPosition]);

    const handleGetClientRequestById = async () => {
        const response = await viewModel.getClientRequestById(idClientRequest);
        if ('id' in response) {
            setClientRequest(response);
            setCurrentStatus(response.status as Status);

            const driverIdFromTrip = (response as any).id_driver_assigned ?? (response as any).id_driver ?? idDriver;
            const carInfoResponse = await viewModel.getDriverCarInfo(driverIdFromTrip);
            if ('brand' in carInfoResponse) {
                setCarInfo(carInfoResponse);
            }

            setLocation({
                latitude: response.pickup_position.y,
                longitude: response.pickup_position.x,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
            const offPosition = viewModel.listenerDriverPositionSocket(response.id_client, driverIdFromTrip, (data: any) => {
                setDriverPosition({
                    latitude: data.lat,
                    longitude: data.lng
                });
            });

            const offStatus = viewModel.listenerUpdateStatusSocket(idClientRequest, (data: any) => {
                if (data?.status) {
                    setCurrentStatus(data.status as Status);
                }

            });
            socketListeners.current.push(offPosition, offStatus);

        }
    }

    const handleGetDirections = async (origin: LatLng, destination: LatLng) => {
        const response: GoogleDirections | null = await viewModel.getDirections(origin, destination);
        if (response !== null) {
            if (response.routes.length > 0) {
                const points = response.routes[0].overview_polyline.points;
                const coordinates = decode(points).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
                setDirectionsRoute(coordinates);

                const durationInSeconds = response.routes[0]?.legs?.[0]?.duration?.value;
                if (typeof durationInSeconds === 'number' && durationInSeconds > 0) {
                    setEtaMinutesFromRoute(Math.max(1, Math.round(durationInSeconds / 60)));
                }
            }
        }
    }



    const toggleView = (isInteractingWithMap: boolean) => {
        setIsInteractingWithMap(isInteractingWithMap);
        Animated.timing(animatedValue, {
            toValue: isInteractingWithMap ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }

    if (!location) {
        return <View style={styles.container} />
    }

    const etaMinutes = etaMinutesFromRoute
        ?? (clientRequest?.google_distance_matrix?.duration?.value
        ? Math.round(clientRequest.google_distance_matrix.duration.value / 60)
        : Math.round(clientRequest?.time_difference ?? 0));

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
                    mapPadding={{ bottom: 120, top: 0, left: 0, right: 0 }}
                    region={location}
                    onRegionChangeComplete={(region) => {
                        toggleView(false);
                    }}
                    onPanDrag={() => toggleView(true)}
                >
                    {
                        driverPosition !== null && (
                            <Marker
                                coordinate={{
                                    latitude: driverPosition.latitude,
                                    longitude: driverPosition.longitude,
                                }}
                                title="Tu conductor"
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
                                    latitude: clientRequest!.pickup_position.y,
                                    longitude: clientRequest!.pickup_position.x
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
                                    latitude: clientRequest!.destination_position.y,
                                    longitude: clientRequest!.destination_position.x
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
                    height: "40%",
                    bottom: 0,
                    backgroundColor: "white",
                    padding: 10,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                }}
            >

                <ScrollView style={{ width: "100%", height: "100%" }} showsVerticalScrollIndicator={false}>

                    <TripProgress status={currentStatus} />
                    <Text style={styles.statusText}>{DRIVER_STATUS_LABELS[currentStatus] ?? ''}</Text>

                    <DeliveryProofSection
                        deliveryCode={currentStatus !== Status.FINISHED ? clientRequest?.delivery_code : null}
                        receiverName={clientRequest?.receiver_name}
                        photos={tripPhotos}
                        canConfirm={currentStatus === Status.TRAVELING}
                        onConfirm={handleConfirmDelivery}
                    />

                    <Text style={styles.textTitle}>TU CONDUCTOR</Text>
                    <View style={styles.rowContainer}>
                        <View style={styles.dataContainer}>
                            <Text>{clientRequest?.driver.name} {clientRequest?.driver.lastname}</Text>
                            <Text>Cel: {clientRequest?.driver.phone}</Text>
                        </View>
                        <Image
                            source={{ uri: clientRequest?.driver.image }}
                            style={styles.userImage}
                        />
                    </View>
                    <View style={styles.rowContainer}>
                        <View style={styles.dataContainer}>
                            <Text>{carInfo?.brand ?? 'Sin marca registrada'}</Text>
                            <Text>{carInfo?.plate ?? 'Sin placa registrada'}</Text>
                            <Text>Llega en {etaMinutes} Mins Aproximadamente</Text>
                        </View>
                        <Image
                            style={styles.userImage}
                            source={require("../../../../assets/suv.png")}
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
                            {clientRequest && <CargoInfo request={clientRequest} showContacts />}
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

                    {[Status.ACCEPTED, Status.ON_THE_WAY, Status.ARRIVED].includes(currentStatus) &&
                        <TouchableOpacity style={{ alignSelf: 'center', padding: 12 }} onPress={() => setIsCancelVisible(true)}>
                            <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancelar viaje</Text>
                        </TouchableOpacity>
                    }

                </ScrollView>
            </Animated.View>
            <CancelReasonModal
                visible={isCancelVisible}
                title="Cancelar el viaje"
                reasons={CLIENT_CANCEL_REASONS}
                onClose={() => setIsCancelVisible(false)}
                onConfirm={handleCancel}
            />
        </View>
    )
}