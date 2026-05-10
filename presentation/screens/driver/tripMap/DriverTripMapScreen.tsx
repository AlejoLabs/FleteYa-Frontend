import { StackScreenProps } from "@react-navigation/stack";
import { Animated, Dimensions, Image, Platform, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
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

    const handleGetClientRequestById = async () => {
        const response = await viewModel.getClientRequestById(idClientRequest);
        console.log('getClientRequestById', response);
        if ('id' in response) {
            setClientRequest(response);

        }
    }

    const handleUpdateStatusToArrived = async (status: Status) => {
        const response = await viewModel.updateStatus(idClientRequest, Status.ARRIVED);
        if (typeof response === 'boolean') {
            console.log('ESTADO ACTUALIZADO CORRECTAMENTE');
            ToastAndroid.show('Estado actualizado', ToastAndroid.LONG);
            setCurrentStatus(Status.ARRIVED);
            viewModel.emitUpdateStatus(idClientRequest, Status.ARRIVED);
            handleGetDirections(
                {
                    latitude: location!.latitude,
                    longitude: location!.longitude,
                },
                {
                    latitude: clientRequest!.destination_position.y,
                    longitude: clientRequest!.destination_position.x,

                }
            );
        }
    }

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
                    handleGetDirections(
                        {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        },
                        {
                            latitude: clientRequest.pickup_position.y,
                            longitude: clientRequest.pickup_position.x,

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

            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 1
                },
                (newLocation) => {
                    console.log('MI UBICACION', newLocation);
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
        console.log('Locacion detenida');
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
                    mapPadding={{ bottom: 120, top: 0, left: 0, right: 0 }}
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
                        (clientRequest !== null && currentStatus === Status.ACCEPTED) && (
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
                        (clientRequest !== null && currentStatus === Status.ARRIVED) && (
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
                        directionsRoute.length > 0 && (<Polyline coordinates={directionsRoute} strokeWidth={6} strokeColor="red" />)
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

                    <TouchableOpacity style={styles.iconContainer} onPress={() => {
                        // navigation.navigate('ProfileUpdateScreen');
                        handleUpdateStatusToArrived(Status.ARRIVED);
                    }}>
                        <View style={styles.iconBox}>
                            <Ionicons name='checkmark' size={25} color='white' />
                        </View>
                        <Text style={styles.textAction}>NOTIFICAR LLEGADA</Text>
                    </TouchableOpacity>

                </View>
            </Animated.View>
        </View>
    )
}