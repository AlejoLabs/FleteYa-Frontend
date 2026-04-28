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
import DefaultTextInput from "../../../components/DefaultTextInput";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";

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
    const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
    const [offer, setOffer] = useState<string>("");

    const [hasLocation, setHasLocation] = useState(false);

    const [originPlace, setOriginPlace] = useState<{
        lat: number,
        lng: number,
        address?: string
    } | undefined>(undefined);

    const [originMarker, setOriginMarker] = useState<LatLng>();

    const [destinationPlace, setDestinationPlace] = useState<{
        lat: number,
        lng: number,
        address?: string
    } | undefined>(undefined);


    const placeAutocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
    const placeAutocompleteDestinationRef = useRef<GooglePlacesAutocompleteRef>(null);
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
                setOriginMarker({
                    latitude: originPlace!.lat,
                    longitude: originPlace!.lng,
                });
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

            }
            else {
                setShouldDrawRoute(false);
            }
            setOriginPlace({
                lat: lat,
                lng: lng,
                address: address
            });

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

                    <TouchableOpacity style={styles.infoContainer} onPress={() => setIsOriginModalVisible(true)}>
                        <Text>{originPlace?.address ?? "Recoger en..."}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoContainer} onPress={() => setIsDestinationModalVisible(true)}>
                        <Text>{destinationPlace?.address ?? "Destino..."}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoContainer} onPress={() => setIsOfferModalVisible(true)}>
                        <Text>{offer === "" ? "Oferta" : `Oferta: ${offer}`}</Text>
                    </TouchableOpacity>

                    <Modal
                        visible={isOriginModalVisible}
                        animationType="slide"
                        onRequestClose={() => setIsOriginModalVisible(false)}
                        transparent={true}
                        onShow={() => {
                            placeAutocompleteRef.current?.setAddressText("");
                            setTimeout(() => {
                                placeAutocompleteRef.current?.focus();
                            }, 200);
                        }}
                    >
                        <Pressable style={styles.modalOverlay} onPress={() => setIsOriginModalVisible(false)}>
                            <Pressable style={styles.modalContent} onPress={() => { }}>
                                <View style={styles.viewDecoration}>
                                    <Text style={styles.textDecoration}>Selecciona tu origen</Text>
                                </View>
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
                        onShow={() => {
                            placeAutocompleteDestinationRef.current?.setAddressText("");
                            setTimeout(() => {
                                placeAutocompleteDestinationRef.current?.focus();
                            }, 200);
                        }}
                    >
                        <Pressable style={styles.modalOverlay} onPress={() => setIsDestinationModalVisible(false)}>
                            <Pressable style={styles.modalContent} onPress={() => { }}>
                                <View style={styles.viewDecoration}>
                                    <Text style={styles.textDecoration}>Selecciona tu destino</Text>
                                </View>
                                <GooglePlacesAutocomplete
                                    ref={placeAutocompleteDestinationRef}
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

                    <Modal
                        visible={isOfferModalVisible}
                        animationType="slide"
                        onRequestClose={() => setIsOfferModalVisible(false)}
                        transparent={true}
                        onShow={() => {
                            /*  placeAutocompleteDestinationRef.current?.setAddressText("");
                             setTimeout(() => {
                                 placeAutocompleteDestinationRef.current?.focus();
                             }, 200); */
                        }}
                    >
                        <Pressable style={styles.modalOverlay} onPress={() => setIsOfferModalVisible(false)}>
                            <Pressable style={styles.modalContent} onPress={() => { }}>
                                <View style={styles.viewDecoration}>
                                    <Text style={styles.textDecoration}>Agrega una oferta</Text>
                                </View>
                                <DefaultTextInput
                                    icon={require('../../../../assets/dolar.png')}
                                    placeholder="Precio"
                                    onChangeText={setOffer}
                                    value={offer}
                                    keyboardType="numeric"
                                    textColor="black"
                                    placeholderTextColor="gray"
                                />

                            </Pressable>
                        </Pressable>

                    </Modal>


                    <View style={styles.timeAndDistanceView}>
                        <Text style={styles.timeAndDistanceText}>Precio recomendado: ${Math.round((timeAndDistance?.recommended_value ?? 0) / 100) * 100}</Text>
                        <Text style={styles.timeAndDistanceText}>Tiempo y distancia: {timeAndDistance?.duration.text} {timeAndDistance?.distance.text}</Text>
                    </View>

                    <DefaultRoundedButton 
                        onPress={() => {}}
                        text="Solicitar conductor"
                        backgroundColor="black"
                    />

                </View>
            </Animated.View>


            <Image
                style={{
                    height: 40,
                    width: 40,
                    position: "absolute",
                    top: isInteractingWithMap ? "40%" : "28%",
                }}
                source={require("../../../../assets/pin_red.png")}
            />
        </View>
    )
}