import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { LatLng } from "react-native-maps";
import * as Location from "expo-location";
import { DriverTripMapViewModel } from "../DriverTripMapViewModel";

// GPS del conductor durante el viaje: lo muestra en su mapa y se lo envía al cliente, que lo sigue en el suyo.
// Arranca cuando se sabe quién es el cliente (idClient) y se apaga al salir de la pantalla
export function useDriverTracking(viewModel: DriverTripMapViewModel, idClient?: number) {
    const [location, setLocation] = useState<LatLng | null>(null);
    const [unavailable, setUnavailable] = useState(false);
    const subscription = useRef<Location.LocationSubscription | null>(null);

    // Al terminar o dejar el viaje: el GPS deja de enviar la posición y el conductor sale de la lista de conectados
    const stop = () => {
        if (!subscription.current) return;
        viewModel.discconectSocket();
        subscription.current.remove();
        subscription.current = null;
    }

    useEffect(() => {
        if (idClient === undefined) return;
        let active = true;
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!active) return;
                if (status !== 'granted') {
                    setUnavailable(true);
                    return;
                }
                // En segundo plano el cliente lo sigue viendo aunque el conductor abra otra app (por ejemplo, el navegador)
                if (Platform.OS === 'android') await Location.requestBackgroundPermissionsAsync();
                viewModel.initSocket();
                // Cada 3 s o 5 m se ve fluido en el mapa del cliente sin saturar el teléfono
                const watch = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
                    ({ coords }) => {
                        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
                        viewModel.emitDriverPosition(idClient, coords.latitude, coords.longitude);
                    },
                );
                if (active) subscription.current = watch;
                else watch.remove();
            } catch (error) {
                // Ubicación apagada o sin precisión en los ajustes del teléfono
                console.log('No se pudo obtener la ubicación', error);
                if (active) setUnavailable(true);
            }
        })();
        return () => {
            active = false;
            subscription.current?.remove();
            subscription.current = null;
        };
    }, [idClient]);

    return { location, unavailable, stop };
}
