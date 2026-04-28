import { Platform, View, Image } from "react-native";
import styles from "./Styles";
import { useEffect, useRef, useState } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { DriverMyLocationMapViewModel } from "./DriverMyLocationMapViewModel";
import { container } from "../../../../di/container";
import ToggleSwitch from "toggle-switch-react-native";
import { useAuth } from "../../../hooks/useAuth";

export default function DriverMyLocationMapScreen() {

    const viewModel: DriverMyLocationMapViewModel = container.resolve('driverMyLocationMapViewModel');
    const [location, setLocation] = useState<Region | undefined>(undefined);
    const [tracking, setTracking] = useState<boolean>(true);
    const {authResponse} = useAuth();
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

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
    }, [tracking]);

    useEffect(() => {
        if(location != undefined){
            emitPosition();
        }
    }, [location]);

    const startRealTimeLocation = async () => {
        if (!locationSubscription.current) {

            locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 1000,
                distanceInterval: 1
            },
            (newLocation) => {
                console.log('NUEVA UBICACION:', newLocation);

                setLocation({
                    latitude: newLocation.coords.latitude,
                    longitude: newLocation.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                
            }

        );
        }

        viewModel.initSocket();
    }

    const emitPosition = () => {
        if(authResponse?.user != null && location != undefined){
            viewModel.emitDriverPosition(authResponse?.user.id!, location!.latitude, location!.longitude);
        }
    }

    const stopRealTimeLocation = () => {
        console.log('Locacion detenida');
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    }


    if (!location) {
        return <View style={styles.container}></View>
    }

    return (
        <View style={styles.container}>
            <ToggleSwitch
                isOn={tracking}
                onColor="red"
                offColor="gray"
                label={tracking ? "Desahabilitar" : "Habilitar"}
                onToggle={(isOn) => setTracking(isOn)}
            />
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
                                style={{ resizeMode: "contain", width: 50, height: 50 }}
                            />
                        </View>
                    </Marker>
                    )
                }


            </MapView>
        </View>
    );
}