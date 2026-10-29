import { useEffect, useRef, useState } from "react";
import MapView, { LatLng } from "react-native-maps";
import * as Location from 'expo-location';
import { ClientSearchMapViewModel } from "../ClientSearchMapViewModel";

export interface DriverMarker {
    id: number;
    idSocket: string;
    lat: number;
    lng: number;
}

// Bogotá mientras llega la ubicación del teléfono
export const DEFAULT_REGION = {
    latitude: 4.6243,
    longitude: -74.1520,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

// Mapa del cliente: se centra una vez en su ubicación y muestra los conductores conectados cerca
export function useClientMap(viewModel: ClientSearchMapViewModel) {

    const mapRef = useRef<MapView>(null);
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);
    const [driverMarkers, setDriverMarkers] = useState<DriverMarker[]>([]);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const hasCentered = useRef(false);

    const moveCamera = (lat: number, lng: number, zoom = 17) => {
        mapRef.current?.animateCamera({ center: { latitude: lat, longitude: lng }, zoom, pitch: 0, heading: 0 }, { duration: 800 });
    }

    const centerOnUser = () => {
        if (userLocation) moveCamera(userLocation.latitude, userLocation.longitude);
    }

    // El mapa ya deja libre el alto de la hoja (mapPadding): aquí solo va el aire alrededor de la ruta
    const fitRoute = (points: LatLng[]) => {
        if (points.length < 2) return;
        mapRef.current?.fitToCoordinates(points, {
            edgePadding: { top: 80, right: 40, bottom: 30, left: 40 },
            animated: true,
        });
    }

    // Centro real de la cámara: con la hoja encima, el centro de la región visible no es el punto del pin
    const getCenter = async (): Promise<LatLng | null> => {
        try {
            const camera = await mapRef.current?.getCamera();
            return camera?.center ?? null;
        } catch {
            return null;
        }
    }

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;
        let active = true;
        const offListeners: (() => void)[] = [];

        // El socket no depende de la ubicación: sin él no llegan los conductores cercanos ni las ofertas
        viewModel.initSocket();
        offListeners.push(
            viewModel.listenerDriverPositionSocket((data: any) => {
                const marker = { id: data.id, idSocket: data.id_socket, lat: data.lat, lng: data.lng };
                setDriverMarkers((prev) => prev.some((m) => m.idSocket === marker.idSocket)
                    ? prev.map((m) => m.idSocket === marker.idSocket ? marker : m)
                    : [...prev, marker]);
            }),
            viewModel.listenerDriverDisconnectSocket((idSocket: string) => {
                setDriverMarkers((prev) => prev.filter((m) => m.idSocket !== idSocket));
            }),
        );

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!active) return;
                if (status !== 'granted') {
                    setPermissionDenied(true);
                    return;
                }
                // Solo se necesita para centrar el mapa: no hace falta GPS de navegación cada segundo
                subscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                    ({ coords }) => {
                        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
                        if (!hasCentered.current) {
                            hasCentered.current = true;
                            moveCamera(coords.latitude, coords.longitude);
                        }
                    },
                );
                if (!active) subscription.remove();
            } catch (error) {
                // Ubicación apagada o sin precisión en los ajustes del teléfono: el mapa queda en Bogotá
                // y el origen se puede buscar o marcar moviendo el mapa
                console.log('No se pudo obtener la ubicación', error);
                setPermissionDenied(true);
            }
        })();

        return () => {
            active = false;
            subscription?.remove();
            offListeners.forEach((off) => off());
        };
    }, []);

    return { mapRef, userLocation, driverMarkers, permissionDenied, moveCamera, centerOnUser, fitRoute, getCenter };
}
