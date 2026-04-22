import { View, Text, Platform } from "react-native"
import styles from "./Styles"
import MapView, { Marker, Region } from "react-native-maps";
import { useEffect, useState } from "react";
import * as Location from 'expo-location';

export default function ClientSearchMapScreen() {

    const [location, setLocation] = useState<Region | undefined>(undefined);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permiso de ubicación denegado');
                return;
            }

            if (Platform.OS === 'android') {
                const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
                if (backgroundStatus !== 'granted') {
                    console.log('Permiso de ubicación en segundo plano denegado');
                }
            }
                

            let location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        })();
    }, []);

    if (!location) {
        return (
            <View style={styles.container}></View>
        );
    }

    return(
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={location}>
                <Marker coordinate={{
                    latitude: location!.latitude,
                    longitude: location!.longitude,
                }} title="Mi ubicación" />
            </MapView>
        </View>
    )
}