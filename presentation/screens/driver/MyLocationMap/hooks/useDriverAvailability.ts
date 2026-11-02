import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { LatLng } from "react-native-maps";
import * as Location from "expo-location";
import { DriverMyLocationMapViewModel } from "../DriverMyLocationMapViewModel";

// Disponible = el GPS guarda la posición del conductor y la emite: así le llegan solicitudes y los clientes lo ven en el mapa.
// No disponible = deja de enviarla y sale de la lista de conectados. Mientras el admin no lo apruebe (o tenga un
// documento vencido) canWork es false y no se pone disponible aunque lo pida; null = todavía no se sabe
export function useDriverAvailability(viewModel: DriverMyLocationMapViewModel, idDriver: number | undefined, canWork: boolean | null) {
    const [available, setAvailable] = useState(true);
    const [location, setLocation] = useState<LatLng | null>(null);
    const [locationUnavailable, setLocationUnavailable] = useState(false);
    const subscription = useRef<Location.LocationSubscription | null>(null);

    const stop = () => {
        if (!subscription.current) return;
        viewModel.discconectSocket();
        subscription.current.remove();
        subscription.current = null;
    }

    useEffect(() => {
        if (!idDriver) return;
        if (!available || canWork !== true) {
            stop();
            return;
        }
        let active = true;
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!active) return;
                if (status !== 'granted') {
                    setLocationUnavailable(true);
                    return;
                }
                if (Platform.OS === 'android') await Location.requestBackgroundPermissionsAsync();
                setLocationUnavailable(false);
                viewModel.initSocket();
                if (subscription.current) return;
                // Va por tiempo (cada 4 s) y sin distancia mínima: así un conductor quieto sigue apareciendo
                // a los clientes que abren el mapa después
                const watch = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 4000, distanceInterval: 0 },
                    ({ coords }) => {
                        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
                        viewModel.createDriverPosition({ id_driver: idDriver, lat: coords.latitude, lng: coords.longitude });
                        viewModel.emitDriverPosition(idDriver, coords.latitude, coords.longitude);
                    },
                );
                if (active && available) subscription.current = watch;
                else watch.remove();
            } catch (error) {
                // Ubicación apagada o sin precisión en los ajustes del teléfono
                console.log('No se pudo obtener la ubicación', error);
                if (active) setLocationUnavailable(true);
            }
        })();
        return () => {
            active = false;
        };
    }, [available, idDriver, canWork]);

    // Al cerrar sesión la pantalla se desmonta: sin esto el GPS sigue enviando la posición sin token
    useEffect(() => () => {
        subscription.current?.remove();
        subscription.current = null;
    }, []);

    return { available: available && canWork === true, setAvailable, location, locationUnavailable };
}
