import { RefObject, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { LatLng, Marker, Polyline } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius } from "../../../theme";
import { useTranslation } from 'react-i18next';

interface Props {
    mapRef: RefObject<MapView | null>;
    // Alto de la hoja inferior: el mapa deja ese espacio abajo para que la ruta no quede tapada
    bottomInset: number;
    initialCenter: LatLng;
    vehicle: LatLng | null;
    vehicleTitle: string;
    // Después de recoger la carga el punto de recogida ya no importa
    pickup: LatLng | null;
    destination: LatLng;
    route: LatLng[];
}

// Mapa del viaje en curso: el vehículo, la recogida, el destino y el recorrido que falta
export default function TripMap({ mapRef, bottomInset, initialCenter, vehicle, vehicleTitle, pickup, destination, route }: Props) {
    const { t } = useTranslation();
    // Cambiar el margen antes de que Google Maps termine de cargar tumba la app en Android (setPadding sobre un mapa nulo)
    const [ready, setReady] = useState(false);
    return (
        <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{ ...initialCenter, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
            mapPadding={ready ? { top: 0, right: 0, bottom: bottomInset, left: 0 } : undefined}
            onMapReady={() => setReady(true)}
            showsMyLocationButton={false}
            toolbarEnabled={false}
        >
            {route.length > 1 && <Polyline coordinates={route} strokeWidth={5} strokeColor={colors.asphalt} />}
            {pickup &&
                <Marker coordinate={pickup} anchor={{ x: 0.5, y: 0.5 }} title={t('tripMap.recogida')}>
                    <View style={styles.pickup} />
                </Marker>
            }
            <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }} title={t('common.destino')}>
                <Ionicons name="location" size={36} color={colors.pinDestination} />
            </Marker>
            {vehicle &&
                <Marker coordinate={vehicle} anchor={{ x: 0.5, y: 0.5 }} title={vehicleTitle} zIndex={2}>
                    <View style={styles.vehicle}>
                        <MaterialCommunityIcons name="truck" size={18} color={colors.asphalt} />
                    </View>
                </Marker>
            }
        </MapView>
    );
}

// Encuadra los puntos encima de la hoja (el mapa ya deja su alto libre): arriba queda aire para el botón del menú
export const fitPoints = (mapRef: RefObject<MapView | null>, points: LatLng[]) => {
    if (points.length === 0) return;
    if (points.length === 1) {
        mapRef.current?.animateCamera({ center: points[0], zoom: 16 }, { duration: 800 });
        return;
    }
    mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 96, right: 48, bottom: 32, left: 48 },
        animated: true,
    });
}

const styles = StyleSheet.create({
    pickup: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.pinOrigin,
        borderWidth: 4,
        borderColor: colors.surface,
    },
    vehicle: {
        width: 34,
        height: 34,
        borderRadius: radius.sm + 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cargo,
        borderWidth: 2,
        borderColor: colors.asphalt,
    },
});
