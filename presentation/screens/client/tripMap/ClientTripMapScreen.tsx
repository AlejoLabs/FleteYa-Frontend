import { View, Image, Animated, Dimensions, Text, TouchableOpacity, Modal, Pressable, ToastAndroid, FlatList } from "react-native"
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

    useEffect(() => {
        viewModel.initSocket();
        handleGetClientRequestById();
    }, []);

    useEffect(() => {
        if (isDriverPositionSet === true) {
            console.log('SOLO SE EJECUTO UNA VEZ');
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
        if(currentStatus === Status.ARRIVED && driverPosition !== null && clientRequest){
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
        console.log('getClientRequestById', response);
        if ('id' in response) {
            setClientRequest(response);

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
            viewModel.listenerDriverPositionSocket(response.id_client, (data: any) => {
                console.log('Conductor Asignado: ', data);
                setDriverPosition({
                    latitude: data.lat,
                    longitude: data.lng
                });
            });

            viewModel.listenerUpdateStatusSocket(idClientRequest, (data: any) => {
                console.log('NUEVO ESTADO DEL VIAJE: ', data);
                if(data.status === Status.ARRIVED){
                    setCurrentStatus(Status.ARRIVED);
                }
                else if(data.status === Status.FINISHED){
                    setCurrentStatus(Status.FINISHED);
                }
                    
            });

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
                        (clientRequest !== null && currentStatus === Status.ACCEPTED) && (
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
                        (clientRequest !== null && currentStatus === Status.ARRIVED) && (
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

                <View style={{ width: "100%", height: "100%" }}>

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
                                {clientRequest?.fare_offered?.toLocaleString('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0,
                                })}
                            </Text>
                        </View>
                    </View>

                </View>
            </Animated.View>
        </View>
    )
}