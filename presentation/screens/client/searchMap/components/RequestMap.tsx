import { RefObject, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { LatLng, Marker, Polyline } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../../theme";
import { DEFAULT_REGION, DriverMarker } from "../hooks/useClientMap";
import { PlacePoint } from "../RequestDraft";

interface Props {
    mapRef: RefObject<MapView | null>;
    // Alto de la hoja inferior: el mapa deja ese espacio abajo para que el pin y la ruta no queden tapados
    bottomInset: number;
    // Paso de la ruta: el origen es el centro del mapa y se marca con el pin fijo
    pickingOrigin: boolean;
    origin: PlacePoint | null;
    destination: PlacePoint | null;
    route: LatLng[];
    drivers: DriverMarker[];
    onMoveStart: () => void;
    onMoveEnd: () => void;
}

export default function RequestMap({ mapRef, bottomInset, pickingOrigin, origin, destination, route, drivers, onMoveStart, onMoveEnd }: Props) {
    // Cambiar el margen antes de que Google Maps termine de cargar tumba la app en Android (setPadding sobre un mapa nulo)
    const [ready, setReady] = useState(false);
    return (
        <View style={StyleSheet.absoluteFill}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={DEFAULT_REGION}
                mapPadding={ready ? { top: 0, right: 0, bottom: bottomInset, left: 0 } : undefined}
                onMapReady={() => setReady(true)}
                showsUserLocation
                showsMyLocationButton={false}
                toolbarEnabled={false}
                onPanDrag={onMoveStart}
                onRegionChangeComplete={onMoveEnd}
            >
                {drivers.map((driver) => (
                    <Marker key={driver.idSocket} coordinate={{ latitude: driver.lat, longitude: driver.lng }} anchor={{ x: 0.5, y: 0.5 }} title="Conductor disponible">
                        <View style={styles.driver}>
                            <MaterialCommunityIcons name="truck" size={16} color={colors.cargo} />
                        </View>
                    </Marker>
                ))}
                {!pickingOrigin && origin &&
                    <Marker coordinate={{ latitude: origin.lat, longitude: origin.lng }} anchor={{ x: 0.5, y: 0.5 }} title="Recoger aquí">
                        <View style={styles.originDot} />
                    </Marker>
                }
                {destination &&
                    <Marker coordinate={{ latitude: destination.lat, longitude: destination.lng }} anchor={{ x: 0.5, y: 1 }} title="Llevar aquí">
                        <Ionicons name="location" size={36} color={colors.pinDestination} />
                    </Marker>
                }
                {route.length > 1 && <Polyline coordinates={route} strokeWidth={5} strokeColor={colors.asphalt} />}
            </MapView>

            {/* El pin no es un marcador del mapa: se queda quieto en el centro y el mapa se mueve debajo */}
            {pickingOrigin &&
                <View pointerEvents="none" style={[styles.centerArea, { bottom: bottomInset }]}>
                    <View style={styles.centerPin} accessibilityLabel="Punto de recogida">
                        <Ionicons name="location" size={44} color={colors.pinOrigin} />
                    </View>
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    driver: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.asphalt,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    originDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.pinOrigin,
        borderWidth: 4,
        borderColor: colors.surface,
    },
    centerArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // La punta del pin queda en el centro: se sube la mitad de su alto
    centerPin: {
        marginBottom: 44,
    },
});
