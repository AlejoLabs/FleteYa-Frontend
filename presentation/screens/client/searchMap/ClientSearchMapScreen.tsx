import { View, Image } from "react-native"
import styles from "./Styles"
import MapView, { LatLng, Marker, Region } from "react-native-maps";
import { useEffect, useState } from "react";
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
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
    const viewModel = container.resolve("clientSearchMapViewModel");

    useEffect(() => {
        console.log("Response selectedPlace:", selectedPlace);
    }, [selectedPlace])

    const handlegetPlaceDetails = async (placeId: string) =>{
        const response: PlaceDetail | null = await viewModel.getPlaceDetails(placeId);
        if (response !== null){
            setSelectedPlace({
            latitude: response!.result.geometry.location.lat,
            longitude: response!.result.geometry.location.lng
        })
        }
    }

    const handlegetPlaceDetailsByCoords = async (lat: number, lng: number) =>{
        const response: PlaceGeocodeDetail | null = await viewModel.getPlaceDetailsByCoords(lat, lng);
        console.log("RESPONSE BY COORDS:", response?.results[0]);
        if (response !== null){
 
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

    return(
        <View style={styles.container}>
            
            <MapView 
                style={styles.map} 
                initialRegion={location} 
                region={location}
                onRegionChangeComplete={(region) =>{
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