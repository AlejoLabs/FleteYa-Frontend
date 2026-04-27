import { View, Image, Animated, Dimensions, Text, TouchableOpacity, Modal, Pressable } from "react-native"
import styles from "./Styles"
import MapView, { Camera, LatLng, Marker, Polyline, Region } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { container } from "../../../../di/container";
import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../../../domain/models/PlaceGeocodeDetail";
import { GoogleMapsApiKey } from "../../../../data/sources/remote/api/GoogleMapsApiKey";
import { ClientSearchMapViewModel } from "./ClientSearchMapViewModel";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { decode } from "@googlemaps/polyline-codec";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";

const DEFAULT_REGION: Region = {
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function ClientSearchMapScreen() {

    const viewModel: ClientSearchMapViewModel = container.resolve("clientSearchMapViewModel");
    const [location, setLocation] = useState<Region>(DEFAULT_REGION);
    const [directionsRoute, setDirectionsRoute] = useState<LatLng[]>([]);
    const [shouldDrawRoute, setShouldDrawRoute] = useState<boolean>(false);
    const [isInteractingWithMap, setIsInteractingWithMap] = useState<boolean>(false);
    const [timeAndDistance, setTimeAndDistance] = useState<TimeAndDistanceValues>();
    const [isOriginModalVisible, setIsOriginModalVisible] = useState(false);
    const [isDestinationModalVisible, setIsDestinationModalVisible] = useState(false);

    const [hasLocation, setHasLocation] = useState(false);

    const [originPlace, setOriginPlace] = useState<{
        lat: number,
        lng: number,
        address?: string
    } | undefined>(undefined);

    const [destinationPlace, setDestinationPlace] = useState<{
        lat: number,
        lng: number,
        address?: string
    } | undefined>(undefined);


    const placeAutocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
    const mapRef = useRef<MapView>(null);
    const animatedValue = useRef(new Animated.Value(0)).current;



    useEffect(() => {
        if (originPlace != undefined && destinationPlace !== undefined && shouldDrawRoute) {
            console.log("Ya selecciono lo datos de ubicacion");
            console.log("Origin:", originPlace);
            console.log("Destination:", destinationPlace);
            handleGetDirections();
            handleGetTimeAndDistance();
        }
    }, [originPlace, destinationPlace, shouldDrawRoute]);

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

    const handleGetTimeAndDistance = async () => {
        const response: TimeAndDistanceValues | ErrorResponse = await viewModel.getTimeAndDistance(
            {
                latitude: originPlace!.lat,
                longitude: originPlace!.lng,
            },
            {
                latitude: destinationPlace!.lat,
                longitude: destinationPlace!.lng,
            }
        );
        if ('distance' in response) {
            const result = response as TimeAndDistanceValues;
            setTimeAndDistance(result);
        }
        else {
            const error = response as ErrorResponse;
        }
    }

    const handleGetDirections = async () => {
        const response: GoogleDirections | null = await viewModel.getDirections(
            {
                latitude: originPlace!.lat,
                longitude: originPlace!.lng,
            },
            {
                latitude: destinationPlace!.lat,
                longitude: destinationPlace!.lng,
            }
        );
        if (response !== null) {
            if (response.routes.length > 0) {
                const points = response.routes[0].overview_polyline.points;
                const coordinates = decode(points).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
                setDirectionsRoute(coordinates);
            }
        }
    }

    const handlegetPlaceDetails = async (placeId: string, isOrigin: boolean) => {
        const response: PlaceDetail | null = await viewModel.getPlaceDetails(placeId);
        if (response !== null) {
            const lat = response.result.geometry.location.lat;
            const lng = response.result.geometry.location.lng;
            const address = response.result.formatted_address;
            if (isOrigin) {
                moveCameraToLocation(lat, lng);
                setOriginPlace({
                    lat: lat,
                    lng: lng,
                    address: address
                });
                setIsOriginModalVisible(false);
            } else {
                setDestinationPlace({
                    lat: lat,
                    lng: lng,
                    address: address
                });
                setIsDestinationModalVisible(false);
            }
            setShouldDrawRoute(true);
        }
    }

    const handlegetPlaceDetailsByCoords = async (lat: number, lng: number) => {
        const response: PlaceGeocodeDetail | null = await viewModel.getPlaceDetailsByCoords(lat, lng);
        if (response !== null) {
            const address = response.results[0].formatted_address;
            placeAutocompleteRef.current?.setAddressText(address);
            if (originPlace === undefined) {
                setShouldDrawRoute(true);
                setOriginPlace({
                    lat: lat,
                    lng: lng,
                    address: address
                });
            }
            else {
                setShouldDrawRoute(false);
            }

        }
    }

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permiso de ubicacion denegado');
                    return;
                }

                const currentLocation = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                setHasLocation(true);
            } catch (error) {
                console.log('No se pudo obtener la ubicacion actual', error);
            }
        })();
    }, []);

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
                    mapPadding={{ bottom: 80, top: 0, left: 0, right: 0 }}
                    region={location}
                    onRegionChangeComplete={(region) => {
                        toggleView(false);
                        handlegetPlaceDetailsByCoords(region.latitude, region.longitude);
                    }}
                    onPanDrag={() => toggleView(true)}
                >
                    {
                        originPlace && (<Marker coordinate={{
                            latitude: originPlace!.lat,
                            longitude: originPlace!.lng
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
                    }

                </MapView>
            </Animated.View>

            <Animated.View
                style={{
                    transform: [
                        { scaleY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }) },
                        { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }) }
                    ],
                    width: "100%",
                    position: "absolute",
                    height: "30%",
                    bottom: 0,
                    backgroundColor: "gray",
                    padding: 10,
                }}
            >

                <View style={{ width: "100%", height: "100%" }}>

                    <TouchableOpacity onPress={() => setIsOriginModalVisible(true)}>
                        <Text>Recoger en</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsDestinationModalVisible(true)}>
                        <Text>Destino</Text>
                    </TouchableOpacity>

                    <Modal
                        visible={isOriginModalVisible}
                        animationType="slide"
                        onRequestClose={() => setIsOriginModalVisible(false)}
                        transparent={true}
                    >
                        <Pressable style={styles.modalOverlay} onPress={() => setIsOriginModalVisible(false)}>
                            <Pressable style={styles.modalContent} onPress={() => { }}>
                                <GooglePlacesAutocomplete
                                    ref={placeAutocompleteRef}
                                    styles={{ container: { width: "100%" } }}
                                    placeholder="Recoger en..."
                                    onPress={(data, details = null) => {
                                        if (details) {
                                            handlegetPlaceDetails(details!.place_id, true);
                                        }
                                    }}
                                    query={{
                                        key: GoogleMapsApiKey,
                                        language: "es",
                                    }}
                                    debounce={200}
                                />

                            </Pressable>
                        </Pressable>

                    </Modal>

                    <Modal
                        visible={isDestinationModalVisible}
                        animationType="slide"
                        onRequestClose={() => setIsDestinationModalVisible(false)}
                        transparent={true}
                    >
                        <Pressable style={styles.modalOverlay} onPress={() => setIsDestinationModalVisible(false)}>
                            <Pressable style={styles.modalContent} onPress={() => { }}>
                                <GooglePlacesAutocomplete
                                    styles={{ container: { width: "100%" } }}
                                    placeholder="Destino"
                                    onPress={(data, details = null) => {
                                        if (details) {
                                            handlegetPlaceDetails(details!.place_id, false);
                                        }
                                    }}
                                    query={{
                                        key: GoogleMapsApiKey,
                                        language: "es",
                                    }}
                                    debounce={200}
                                />

                            </Pressable>
                        </Pressable>

                    </Modal>


                    <View style={styles.timeAndDistanceView}>
                        <Text>Precio recomendado: ${timeAndDistance?.recommended_value.toFixed(0)}</Text>
                        <Text>Tiempo y distancia: ${timeAndDistance?.duration.text} ${timeAndDistance?.distance.text}</Text>
                    </View>
                </View>
            </Animated.View>


            <Image
                style={{
                    height: 40,
                    width: 40,
                    position: "absolute",
                    top: isInteractingWithMap ? "45%" : "35%",
                }}
                source={require("../../../../assets/pin_red.png")}
            />
        </View>
    )
}