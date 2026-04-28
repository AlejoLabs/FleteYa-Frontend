import { Platform, View, Image } from "react-native";
import styles from "./Styles";
import { useEffect, useState } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { DriverMyLocationMapViewModel } from "./DriverMyLocationMapViewModel";
import { container } from "../../../../di/container";

export default function DriverMyLocationMapScreen() {
    
    const viewModel: DriverMyLocationMapViewModel = container.resolve('driverMyLocationMapViewModel');
    const [location, setLocation] = useState<Region | undefined>(undefined);

    useEffect(() => {
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
                setLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                viewModel.initSocket();
            } catch (error) {
                console.log('No se pudo obtener la ubicacion actual', error);
            }
        })();
    }, []);

    if (!location) {
        return <View style={styles.container}></View>
    }
    return (
        <View style={styles.container}>
            <MapView
                style={{
                    width: "100%",
                    height: "100%",
                }}
                initialRegion={location}
                zoomControlEnabled={true}
            >
                {
                    location &&
                    (<Marker
                        coordinate={{
                            latitude: location!.latitude,
                            longitude: location!.longitude
                        }}
                        title="Mi Localizacion"
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


            </MapView>
        </View>
    );
}