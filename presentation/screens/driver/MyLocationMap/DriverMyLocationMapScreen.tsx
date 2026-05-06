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

    const handleCreateDriverPosition = async (coords: { latitude: number; longitude: number }) => {
        if (authResponse?.user && coords) {
            const response = await viewModel.createDriverPosition({
                id_driver: authResponse.user.id!,
                lat: coords.latitude,
                lng: coords.longitude
            });

            console.log('Response Driver Position:', response);
        }
    }

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
                handleCreateDriverPosition(currentCoords);
                
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
            viewModel.discconectSocket();
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
                mapPadding={{ bottom: 50, top: 0, left: 0, right: 0 }}
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