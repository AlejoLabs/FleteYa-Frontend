import { View, Image } from "react-native"
import styles from "./Styles"
import MapView, { Camera, LatLng, Marker, Region } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { container } from "../../../../di/container";
import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../../../domain/models/PlaceGeocodeDetail";

const DEFAULT_REGION: Region = {
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function ClientSearchMapScreen() {

    const [location, setLocation] = useState<Region>(DEFAULT_REGION);
    const [hasLocation, setHasLocation] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<LatLng | undefined>(undefined);
    const placeAutocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
    const mapRef = useRef<MapView>(null);

    const viewModel = container.resolve("clientSearchMapViewModel");

    useEffect(() => {
        console.log("Response selectedPlace:", selectedPlace);
    }, [selectedPlace])

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

    const handlegetPlaceDetails = async (placeId: string) => {
        const response: PlaceDetail | null = await viewModel.getPlaceDetails(placeId);
        if (response !== null) {
            const lat = response.result.geometry.location.lat;
            const lng = response.result.geometry.location.lng;
            setSelectedPlace({
                latitude: lat,
                longitude: lng
            })
            moveCameraToLocation(lat, lng);
        }
    }

    const handlegetPlaceDetailsByCoords = async (lat: number, lng: number) => {
        const response: PlaceGeocodeDetail | null = await viewModel.getPlaceDetailsByCoords(lat, lng);
        console.log("RESPONSE BY COORDS:", response?.results[0]);
        if (response !== null) {
            const address = response.results[0].formatted_address;
            placeAutocompleteRef.current?.setAddressText(address);
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

    return (
        <View style={styles.container}>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={location}
                region={location}
                onRegionChangeComplete={(region) => {
                    console.log("Region:", region);
                    handlegetPlaceDetailsByCoords(region.latitude, region.longitude);
                }}
            >
                {/* hasLocation && (
                    <Marker coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }} title="Mi ubicacion" />
                )*/}
            </MapView>

            <GooglePlacesAutocomplete
                ref={placeAutocompleteRef}
                styles={{ container: styles.placeAutocomplete }}
                placeholder="Recoger en..."
                onPress={(data, details = null) => {
                    console.log('Google Place Details:', details);
                    if (details) {
                        handlegetPlaceDetails(details!.place_id);
                    }
                }}
                query={{
                    key: "AIzaSyCo2zaq4NDH9Yb5q2GzTSy5rE09Vejs0WI",
                    language: "es",
                }}
                debounce={200}
            />
            <Image
                style={styles.pinImage}
                source={require("../../../../assets/pin_red.png")}
            />
        </View>
    )
}