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

    const viewModel = container.resolve("clientSearchMapViewModel");

    useEffect(() => {
        if (originPlace != undefined && destinationPlace !== undefined) {
            console.log("Ya selecciono lo datos de ubicacion");
            console.log("Origin:", originPlace);
            console.log("Destination:", destinationPlace);
        }
    }, [originPlace, destinationPlace]);

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
                })
            } else {
                setDestinationPlace({
                    lat: lat, 
                    lng: lng,
                    address: address
                })
            }
            
        }
    }

    const handlegetPlaceDetailsByCoords = async (lat: number, lng: number) => {
        const response: PlaceGeocodeDetail | null = await viewModel.getPlaceDetailsByCoords(lat, lng);
        if (response !== null) {
            const address = response.results[0].formatted_address;
            placeAutocompleteRef.current?.setAddressText(address);
            setOriginPlace({
                    lat: lat,
                    lng: lng,
                    address: address
                })
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
                    if (details) {
                        handlegetPlaceDetails(details!.place_id, true);
                    }
                }}
                query={{
                    key: "AIzaSyCo2zaq4NDH9Yb5q2GzTSy5rE09Vejs0WI",
                    language: "es",
                }}
                debounce={200}
            />

            <GooglePlacesAutocomplete
                styles={{ container: styles.placeDestinationAutocomplete }}
                placeholder="Destino"
                onPress={(data, details = null) => {
                    if (details) {
                        handlegetPlaceDetails(details!.place_id, false);
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