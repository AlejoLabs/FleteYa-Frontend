import { StackScreenProps } from "@react-navigation/stack";
import { Animated, Dimensions, Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";
import { container } from "../../../../di/container";
import { DriverTripMapViewModel } from "./DriverTripMapViewModel";
import { useEffect, useRef, useState } from "react";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import MapView, { Region } from "react-native-maps";
import styles from './Styles';
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

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

    const handleGetClientRequestById = async () => {
        const response = await viewModel.getClientRequestById(idClientRequest);
        console.log('getClientRequestById', response);
        if ('id' in response) {
            setClientRequest(response);

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
                    {/*
                        originMarker &&
                        (<Marker
                            coordinate={{
                                latitude: originMarker!.latitude,
                                longitude: originMarker!.longitude
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
                        destinationPlace && (<Marker coordinate={{
                            latitude: destinationPlace!.lat,
                            longitude: destinationPlace!.lng
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
                    */}

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