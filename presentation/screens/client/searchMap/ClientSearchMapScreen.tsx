import { View } from "react-native"
import styles from "./Styles"
import MapView, { Marker, Region } from "react-native-maps";
import { useEffect, useState } from "react";
import * as Location from 'expo-location';

const DEFAULT_REGION: Region = {
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function ClientSearchMapScreen() {

    const [location, setLocation] = useState<Region>(DEFAULT_REGION);
    const [hasLocation, setHasLocation] = useState(false);

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
            <MapView style={styles.map} initialRegion={location} region={location}>
                {hasLocation && (
                    <Marker coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }} title="Mi ubicacion" />
                )}
            </MapView>
        </View>
    )
}