import { View, Image, Animated, Dimensions, Text, TouchableOpacity, Modal, Pressable, ToastAndroid, ScrollView, TextInput } from "react-native"
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
import { useAuth } from "../../../hooks/useAuth";
import { StackScreenProps } from "@react-navigation/stack";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { formatCOP, formatErrorMessage, formatScheduledDate } from "../../../utils/Formatters";
import CargoDetailsModal, { CargoDetails, DEFAULT_CARGO_DETAILS } from "./CargoDetailsModal";
import SearchingPanel from "./SearchingPanel";
import { cargoCategoryLabel, suggestVehicle, vehicleLabel } from "../../../utils/Cargo";

const PHONE_REGEX = /^3\d{9}$/;

const DEFAULT_REGION: Region = {
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientSearchMapScreen'> { };

export default function ClientSearchMapScreen({ navigation, route }: Props) {

    const viewModel: ClientSearchMapViewModel = container.resolve("clientSearchMapViewModel");
    const { authResponse } = useAuth();
    const [location, setLocation] = useState<Region>(DEFAULT_REGION);
    const [directionsRoute, setDirectionsRoute] = useState<LatLng[]>([]);
    const [shouldDrawRoute, setShouldDrawRoute] = useState<boolean>(false);
    const [isInteractingWithMap, setIsInteractingWithMap] = useState<boolean>(false);
    const [timeAndDistance, setTimeAndDistance] = useState<TimeAndDistanceValues>();
    const recommendedFare = Math.round((timeAndDistance?.recommended_value ?? 0) / 100) * 100;
    const [isOriginModalVisible, setIsOriginModalVisible] = useState(false);
    const [isDestinationModalVisible, setIsDestinationModalVisible] = useState(false);
    const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
    const [isCargoModalVisible, setIsCargoModalVisible] = useState(false);
    const [cargoDetails, setCargoDetails] = useState<CargoDetails>(DEFAULT_CARGO_DETAILS);
    // Búsqueda en curso: mientras exista se muestra el panel "Buscando conductor"
    const [activeSearchId, setActiveSearchId] = useState<number | null>(route.params?.idClientRequest ?? null);
    const [offer, setOffer] = useState<string>("");
    const [cargoWeight, setCargoWeight] = useState<string>("");
    const [cargoLargo, setCargoLargo] = useState<string>("");
    const [cargoAncho, setCargoAncho] = useState<string>("");
    const [cargoAlto, setCargoAlto] = useState<string>("");
    const [cargoDescription, setCargoDescription] = useState<string>("");
    const [driverMarkers, setDriverMarkers] = useState<{ id: number, idSocket: string, lat: number, lng: number }[]>([]);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
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
    const socketListeners = useRef<(() => void)[]>([]);
    const timeAndDistanceRequestId = useRef(0);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            stopRealTimeLocation();
        });
        return unsubscribe;
    }, [navigation]);


    useEffect(() => {
        if (originPlace != undefined && destinationPlace !== undefined && shouldDrawRoute) {
            handleGetDirections();
        }
    }, [originPlace, destinationPlace, shouldDrawRoute]);

    useEffect(() => {
        const allCargoFilled = cargoLargo !== '' && cargoAncho !== '' && cargoAlto !== '' && cargoWeight !== '';
        if (originPlace != undefined && destinationPlace !== undefined && allCargoFilled) {
            handleGetTimeAndDistance();
        }
    }, [cargoWeight, cargoLargo, cargoAncho, cargoAlto, originPlace, destinationPlace]);

    const startRealTimeLocation = async () => {
        if (!locationSubscription.current) {

            // El cliente solo necesita su ubicación para centrar el mapa: no hace falta GPS de navegación cada segundo
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10
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

                }

            );
        }
    }


    const stopRealTimeLocation = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
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
            zoom: 17,
        };
        mapRef.current?.animateCamera(camera, { duration: 1000 });
    }

    useEffect(() => {
        if (route.params?.idClientRequest) setActiveSearchId(route.params.idClientRequest);
    }, [route.params?.idClientRequest]);

    const suggestedVehicle = cargoWeight && cargoLargo && cargoAncho && cargoAlto
        ? suggestVehicle(Number(cargoWeight), Number(cargoLargo), Number(cargoAncho), Number(cargoAlto), cargoDetails.packages)
        : null;

    const cargoSummary = [
        cargoCategoryLabel(cargoDetails.category),
        `${cargoDetails.packages} ${cargoDetails.packages === 1 ? 'bulto' : 'bultos'}`,
        vehicleLabel(cargoDetails.vehicleType ?? suggestedVehicle),
        cargoDetails.scheduledAt ? formatScheduledDate(cargoDetails.scheduledAt) : 'Ahora',
    ].join(' · ');

    const handleCreateClientRequest = async () => {
        if (!originPlace || !destinationPlace) {
            ToastAndroid.show("Debes seleccionar origen y destino", ToastAndroid.SHORT);
            return;
        }

        const missingRequiredField =
            offer.trim() === "" ||
            cargoLargo.trim() === "" ||
            cargoAncho.trim() === "" ||
            cargoAlto.trim() === "" ||
            cargoWeight.trim() === "" ||
            cargoDescription.trim() === "";

        if (missingRequiredField) {
            ToastAndroid.show("Debes completar todos los campos", ToastAndroid.SHORT);
            return;
        }

        const offeredFare = Number(offer);
        if (isNaN(offeredFare) || offeredFare <= 0) {
            ToastAndroid.show("La oferta debe ser un numero mayor a 0", ToastAndroid.SHORT);
            return;
        }

        if (suggestedVehicle === null) {
            ToastAndroid.show("La carga supera la capacidad de un camión; divídela en varios fletes", ToastAndroid.LONG);
            return;
        }
        const details = cargoDetails;
        const contactMissing =
            (details.otherSender && (!details.senderName.trim() || !PHONE_REGEX.test(details.senderPhone))) ||
            (details.otherReceiver && (!details.receiverName.trim() || !PHONE_REGEX.test(details.receiverPhone)));
        if (contactMissing) {
            ToastAndroid.show("Revisa los contactos: nombre y celular de 10 dígitos que empiece por 3", ToastAndroid.LONG);
            setIsCargoModalVisible(true);
            return;
        }
        if (!details.noProhibitedItems) {
            ToastAndroid.show("Confirma en Detalles del flete que la carga no es material peligroso ni animales", ToastAndroid.LONG);
            setIsCargoModalVisible(true);
            return;
        }

        const response: number | ErrorResponse = await viewModel.createClientRequest({
            id_client: authResponse?.user.id!,
            pickup_lat: originPlace?.lat!,
            pickup_lng: originPlace?.lng!,
            pickup_description: originPlace?.address!,
            destination_lat: destinationPlace?.lat!,
            destination_lng: destinationPlace?.lng!,
            destination_description: destinationPlace?.address!,
            fare_offered: offeredFare,
            cargo_description: cargoDescription.trim() === "" ? undefined : cargoDescription.trim(),
            weight_kg: cargoWeight ? Number(cargoWeight) : undefined,
            length_cm: cargoLargo ? Number(cargoLargo) : undefined,
            width_cm: cargoAncho ? Number(cargoAncho) : undefined,
            height_cm: cargoAlto ? Number(cargoAlto) : undefined,
            cargo_category: details.category,
            packages: details.packages,
            is_fragile: details.isFragile,
            needs_cover: details.needsCover,
            vehicle_type: details.vehicleType ?? undefined,
            no_prohibited_items: details.noProhibitedItems,
            helpers: details.helpers,
            pickup_floor: details.pickupFloor,
            pickup_has_elevator: details.pickupFloor > 1 ? details.pickupElevator : undefined,
            destination_floor: details.destinationFloor,
            destination_has_elevator: details.destinationFloor > 1 ? details.destinationElevator : undefined,
            sender_name: details.otherSender ? details.senderName.trim() : undefined,
            sender_phone: details.otherSender ? details.senderPhone : undefined,
            receiver_name: details.otherReceiver ? details.receiverName.trim() : undefined,
            receiver_phone: details.otherReceiver ? details.receiverPhone : undefined,
            scheduled_at: details.scheduledAt ? details.scheduledAt.toISOString() : undefined,
        });
        if (typeof response === "number") {
            // Las fotos se suben antes de avisar a los conductores, para que la solicitud les llegue con ellas
            if (details.photos.length) {
                ToastAndroid.show('Subiendo fotos de la carga...', ToastAndroid.SHORT);
                const failed = await viewModel.uploadCargoPhotos(response, details.photos);
                if (failed) ToastAndroid.show(`No se pudieron subir ${failed} fotos`, ToastAndroid.LONG);
            }
            viewModel.emitNewClientRequest(response);
            setActiveSearchId(response);
        } else {
            ToastAndroid.show(formatErrorMessage(response.message), ToastAndroid.LONG);
        }
    }

    const handleGetTimeAndDistance = async () => {
        // Se pide un precio por cada tecla; si una respuesta vieja llega tarde no debe pisar a la más reciente
        const requestId = ++timeAndDistanceRequestId.current;
        const weight = cargoWeight !== '' ? parseFloat(cargoWeight) : undefined;
        const l = parseFloat(cargoLargo), a = parseFloat(cargoAncho), h = parseFloat(cargoAlto);
        // dimensions are in cm, convert to m³ before sending
        const size = (!isNaN(l) && !isNaN(a) && !isNaN(h)) ? (l / 100) * (a / 100) * (h / 100) : undefined;
        const response: TimeAndDistanceValues | ErrorResponse = await viewModel.getTimeAndDistance(
            {
                latitude: originPlace!.lat,
                longitude: originPlace!.lng,
            },
            {
                latitude: destinationPlace!.lat,
                longitude: destinationPlace!.lng,
            },
            weight,
            size
        );
        if (requestId !== timeAndDistanceRequestId.current) return;
        if ('distance' in response) {
            const result = response as TimeAndDistanceValues;
            setTimeAndDistance(result);
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
        // Google responde 200 aunque falle (REQUEST_DENIED, NOT_FOUND...); sin result no hay coordenadas que usar
        if (response !== null && response.status === 'OK' && response.result) {
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
        // Al iniciar, el mapa puede reportar una región sin dirección (ZERO_RESULTS); se ignora hasta tener una válida
        if (response !== null && response.status === 'OK' && response.results.length > 0) {
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

                startRealTimeLocation();
                viewModel.initSocket();
                const offPosition = viewModel.listenerDriverPositionSocket((data: any) => {
                    const newMarker = {
                        id: data.id,
                        lat: data.lat,
                        lng: data.lng,
                        idSocket: data.id_socket
                    }
                    setDriverMarkers((prevMarkers) => {
                        const markerExists = prevMarkers.some(marker => marker.idSocket === newMarker.idSocket); //MARCADOR AGREGADO
                        if (!markerExists) {
                            return [...prevMarkers, newMarker];
                        }
                        else {
                            return prevMarkers.map(marker => marker.idSocket === newMarker.idSocket ? newMarker : marker);
                        }
                    });
                });
                const offDisconnect = viewModel.listenerDriverDisconnectSocket((idSocket: string) => {
                    setDriverMarkers((prevMarkers) => prevMarkers.filter(marker => marker.idSocket !== idSocket));
                });
                socketListeners.current.push(offPosition, offDisconnect);

                setHasLocation(true);
            } catch (error) {
                console.log('No se pudo obtener la ubicacion actual', error);
            }
        })();

        return () => {
            socketListeners.current.forEach((off) => off());
            socketListeners.current = [];
            stopRealTimeLocation();
        };
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
                    mapPadding={{ bottom: 230, top: 0, left: 0, right: 0 }}
                    region={location}
                    onRegionChangeComplete={(region) => {
                        toggleView(false);
                        handlegetPlaceDetailsByCoords(region.latitude, region.longitude);
                    }}
                    onPanDrag={() => toggleView(true)}
                >
                    {
                        driverMarkers.map((driver) => (
                            <Marker
                                key={driver.idSocket}
                                coordinate={{
                                    latitude: driver.lat,
                                    longitude: driver.lng
                                }}
                                title={` ID Conductor ${driver.id}`}
                            >
                                <View style={{ width: 50, height: 50 }}>
                                    <Image
                                        source={require("../../../../assets/car_yellow.png")}
                                        style={{ resizeMode: "contain", width: "50%", height: "50%" }}
                                    />
                                </View>
                            </Marker>
                        ))
                    }
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
                        directionsRoute.length > 0 && (<Polyline coordinates={directionsRoute} strokeWidth={6} strokeColor="#6200EE" />)
                    }

                </MapView>
            </Animated.View>

            <Animated.View // container blanco 
                style={{
                    transform: [
                        { scaleY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }) },
                        { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 380] }) }
                    ],
                    width: "100%",
                    position: "absolute",
                    height: "53%",
                    bottom: 0,
                    backgroundColor: "white",
                    padding: 10,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                }}
            >

                {/* Con los detalles del flete el formulario ya no cabe en pantallas pequeñas: se desplaza */}
                <ScrollView style={{ width: "100%", height: "100%" }} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    <TouchableOpacity style={styles.infoContainer} onPress={() => setIsOriginModalVisible(true)}>
                        <Text>{originPlace?.address ?? "Recoger en..."}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoContainer} onPress={() => setIsDestinationModalVisible(true)}>
                        <Text>{destinationPlace?.address ?? "Destino..."}</Text>
                    </TouchableOpacity>

                    {/* Cargo inputs: 4 fields in one row */}
                    <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 10, color: 'gray', marginBottom: 2, textAlign: 'center' }}>Largo (cm)</Text>
                            <TextInput
                                value={cargoLargo}
                                onChangeText={setCargoLargo}
                                keyboardType="decimal-pad"
                                placeholder="0.0"
                                placeholderTextColor="#bbb"
                                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 5, fontSize: 13, textAlign: 'center', backgroundColor: '#fafafa' }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 10, color: 'gray', marginBottom: 2, textAlign: 'center' }}>Ancho (cm)</Text>
                            <TextInput
                                value={cargoAncho}
                                onChangeText={setCargoAncho}
                                keyboardType="decimal-pad"
                                placeholder="0.0"
                                placeholderTextColor="#bbb"
                                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 5, fontSize: 13, textAlign: 'center', backgroundColor: '#fafafa' }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 10, color: 'gray', marginBottom: 2, textAlign: 'center' }}>Alto (cm)</Text>
                            <TextInput
                                value={cargoAlto}
                                onChangeText={setCargoAlto}
                                keyboardType="decimal-pad"
                                placeholder="0.0"
                                placeholderTextColor="#bbb"
                                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 5, fontSize: 13, textAlign: 'center', backgroundColor: '#fafafa' }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 10, color: 'gray', marginBottom: 2, textAlign: 'center' }}>Peso (kg)</Text>
                            <TextInput
                                value={cargoWeight}
                                onChangeText={setCargoWeight}
                                keyboardType="decimal-pad"
                                placeholder="0"
                                placeholderTextColor="#bbb"
                                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 5, fontSize: 13, textAlign: 'center', backgroundColor: '#fafafa' }}
                            />
                        </View>
                    </View>

                    <TextInput
                        value={cargoDescription}
                        onChangeText={setCargoDescription}
                        placeholder="Descripcion de carga (trasteo, paquete, repuesto, etc.)"
                        placeholderTextColor="#888"
                        multiline
                        numberOfLines={2}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            fontSize: 14,
                            backgroundColor: '#f3f3f3',
                            marginBottom: 8,
                            textAlignVertical: 'top'
                        }}
                    />

                    <TouchableOpacity style={styles.infoContainer} onPress={() => setIsCargoModalVisible(true)}>
                        <Text numberOfLines={1}>{cargoSummary}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoContainer} onPress={() => setIsOfferModalVisible(true)}>
                        <Text>{offer === "" ? "Oferta" : `Oferta: ${formatCOP(Number(offer))}`}</Text>
                    </TouchableOpacity>

                    <CargoDetailsModal
                        visible={isCargoModalVisible}
                        value={cargoDetails}
                        suggestedVehicle={suggestedVehicle}
                        onChange={(changes) => setCargoDetails((prev) => ({ ...prev, ...changes }))}
                        onClose={() => setIsCargoModalVisible(false)}
                    />

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
                                <View style={{ marginHorizontal: 30, marginBottom: 20 }}>
                                    {
                                        recommendedFare > 0 &&
                                        <DefaultRoundedButton
                                            onPress={() => setOffer(recommendedFare.toString())}
                                            text={`Usar precio sugerido (${formatCOP(recommendedFare)})`}
                                            backgroundColor="gray"
                                        />
                                    }
                                    <DefaultRoundedButton
                                        onPress={() => setIsOfferModalVisible(false)}
                                        text="Confirmar oferta"
                                        backgroundColor="black"
                                    />
                                </View>

                            </Pressable>
                        </Pressable>

                    </Modal>


                    <View style={styles.timeAndDistanceView}>
                        {
                            timeAndDistance
                                ? <>
                                    <Text style={styles.timeAndDistanceText}>Precio recomendado: {formatCOP(recommendedFare)}</Text>
                                    <Text style={styles.timeAndDistanceText}>Tiempo y distancia: {timeAndDistance.duration.text} · {timeAndDistance.distance.text}</Text>
                                </>
                                : <Text style={styles.timeAndDistanceText}>
                                    {destinationPlace === undefined
                                        ? 'Elige el destino para calcular el precio recomendado'
                                        : 'Completa largo, ancho, alto y peso para ver el precio recomendado'}
                                </Text>
                        }
                    </View>

                    <DefaultRoundedButton
                        onPress={() => {
                            handleCreateClientRequest();
                        }}
                        text="Solicitar conductor"
                        backgroundColor="black"
                        marginTop={12}
                    />

                </ScrollView>
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
            {
                activeSearchId !== null &&
                <SearchingPanel
                    key={activeSearchId}
                    viewModel={viewModel}
                    idClientRequest={activeSearchId}
                    navigation={navigation}
                    onClose={() => {
                        setActiveSearchId(null);
                        navigation.setParams({ idClientRequest: undefined });
                    }}
                />
            }
        </View>
    )
}