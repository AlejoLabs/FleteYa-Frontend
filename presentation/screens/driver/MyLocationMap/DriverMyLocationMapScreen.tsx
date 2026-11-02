import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { ParamListBase, useIsFocused } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import { Amount, AppText, Notice, RatingBadge, useToast } from "../../../components/ui";
import { colors, radius, shadows, spacing, touchTarget } from "../../../theme";
import { DEFAULT_REGION } from "../../client/searchMap/hooks/useClientMap";
import { DriverMyLocationMapViewModel } from "./DriverMyLocationMapViewModel";
import { useDriverAvailability } from "./hooks/useDriverAvailability";
import { useDriverSummary } from "./hooks/useDriverSummary";
import { useDriverApproval } from "./hooks/useDriverApproval";
import { useNewRequestAlert } from "./hooks/useNewRequestAlert";
import AvailabilitySwitch from "./components/AvailabilitySwitch";
import NewRequestCard from "./components/NewRequestCard";

type Props = DrawerScreenProps<ParamListBase>;

// Inicio del conductor: lo ganado hoy, si está disponible, su posición en el mapa y el camino a las solicitudes cercanas
export default function DriverMyLocationMapScreen({ navigation }: Props) {

    const viewModel: DriverMyLocationMapViewModel = container.resolve('driverMyLocationMapViewModel');
    const { authResponse } = useAuth();
    const idDriver = authResponse?.user.id;
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const mapRef = useRef<MapView>(null);
    const [mapReady, setMapReady] = useState(false);
    // Alto de los avisos y el botón de abajo: el mapa lo deja libre para que el logo de Google no quede tapado
    const [bottomHeight, setBottomHeight] = useState(0);
    const approval = useDriverApproval(viewModel, idDriver);
    const { available, setAvailable, location, locationUnavailable } = useDriverAvailability(viewModel, idDriver, approval.canWork);
    const summary = useDriverSummary(viewModel, idDriver, location, approval.canWork);
    const { showToast } = useToast();

    // En revisión, rechazado o con un documento vencido no se puede poner disponible: se explica por qué
    const changeAvailability = (value: boolean) => {
        if (value && approval.notice) {
            showToast(approval.notice.title, 'info');
            return;
        }
        setAvailable(value);
    };
    const newRequest = useNewRequestAlert(viewModel, available, location, isFocused, summary.setNearby);

    // El mapa se centra una vez, con la primera ubicación; después el conductor lo mueve a su gusto
    const centered = useRef(false);
    useEffect(() => {
        if (!location || !mapReady || centered.current) return;
        centered.current = true;
        mapRef.current?.animateCamera({ center: location, zoom: 15 }, { duration: 800 });
    }, [location, mapReady]);

    const openRequests = () => navigation.navigate('DriverMapStackNavigator');

    return (
        <View style={styles.screen}>
            {isFocused && <StatusBar style="light" />}
            <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={navigation.openDrawer} hitSlop={8} style={styles.menu} accessibilityRole="button" accessibilityLabel="Abrir menú">
                        <Ionicons name="menu" size={26} color={colors.textOnDark} />
                    </Pressable>
                    <View style={styles.flex}>
                        <AppText variant="bodyStrong" color="textOnDark" numberOfLines={1}>Hola, {authResponse?.user.name}</AppText>
                        <AppText variant="small" color="textOnDarkMuted" numberOfLines={1}>{viewModel.vehicleText(approval.carInfo)}</AppText>
                    </View>
                    <RatingBadge rating={summary.rating} tone="dark" />
                </View>
                <View style={styles.earningsRow}>
                    <View style={styles.flex}>
                        <AppText variant="label" color="textOnDarkMuted">Ganado hoy</AppText>
                        <Amount value={summary.today.earned} size="lg" color="cargo" />
                        <AppText variant="small" color="textOnDarkMuted">
                            {summary.today.trips === 0 ? 'Todavía sin fletes hoy' : `${summary.today.trips} ${summary.today.trips === 1 ? 'flete entregado' : 'fletes entregados'}`}
                        </AppText>
                    </View>
                    <AvailabilitySwitch value={available} onChange={changeAvailability} />
                </View>
            </View>

            <View style={styles.flex}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={DEFAULT_REGION}
                    onMapReady={() => setMapReady(true)}
                    // Cambiar el margen antes de que el mapa cargue tumba la app en Android
                    mapPadding={mapReady ? { top: 0, right: 0, bottom: bottomHeight, left: 0 } : undefined}
                    toolbarEnabled={false}
                >
                    {location &&
                        <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }} title="Tú">
                            <View style={[styles.vehicle, !available && styles.vehicleOff]}>
                                <MaterialCommunityIcons name="truck" size={18} color={available ? colors.asphalt : colors.textOnDark} />
                            </View>
                        </Marker>
                    }
                </MapView>

                <View
                    style={[styles.bottom, { bottom: spacing.lg + insets.bottom }]}
                    pointerEvents="box-none"
                    onLayout={(event) => setBottomHeight(event.nativeEvent.layout.height + spacing.lg + insets.bottom)}
                >
                    {approval.notice &&
                        <Notice
                            tone={approval.notice.tone}
                            title={approval.notice.title}
                            message={approval.notice.message}
                            actionLabel="Ver mi vehículo"
                            onAction={() => navigation.navigate('DriverCarInfoScreen')}
                        />
                    }
                    {!available && !approval.notice && approval.canWork !== null &&
                        <Notice tone="info" message="No estás disponible: no te llegan solicitudes y los clientes no te ven en el mapa." />}
                    {available && locationUnavailable &&
                        <Notice tone="warning" message="No tenemos tu ubicación. Actívala en los ajustes del teléfono para recibir solicitudes." />}
                    {newRequest.alert &&
                        <NewRequestCard
                            fare={newRequest.alert.fare_offered}
                            detail={viewModel.newRequestText(newRequest.alert)}
                            onOpen={() => { newRequest.dismiss(); openRequests(); }}
                            onDismiss={newRequest.dismiss}
                        />
                    }
                    {!newRequest.alert && summary.documentAlert && !approval.notice &&
                        <Notice
                            tone={summary.documentAlert.tone}
                            title={summary.documentAlert.title}
                            message="Renueva el documento para seguir recibiendo fletes."
                            actionLabel="Ver mis documentos"
                            onAction={() => navigation.navigate('DriverCarInfoScreen')}
                        />
                    }
                    <Pressable
                        onPress={openRequests}
                        accessibilityRole="button"
                        accessibilityLabel={summary.nearby ? `Ver solicitudes cerca, hay ${summary.nearby}` : 'Ver solicitudes cerca'}
                        style={({ pressed }) => [styles.requests, pressed && styles.requestsPressed]}
                    >
                        <AppText variant="button">Ver solicitudes cerca</AppText>
                        {available && summary.nearby !== null && summary.nearby > 0 &&
                            <View style={styles.count}>
                                <AppText variant="smallStrong" color="cargo">{summary.nearby > 99 ? '99+' : summary.nearby}</AppText>
                            </View>
                        }
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    flex: {
        flex: 1,
    },
    header: {
        backgroundColor: colors.asphalt,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    menu: {
        width: touchTarget,
        height: touchTarget,
        marginLeft: -spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    earningsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.md,
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
    vehicleOff: {
        backgroundColor: colors.textMuted,
        borderColor: colors.surface,
    },
    bottom: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        gap: spacing.sm,
    },
    requests: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.cargo,
        ...shadows.card,
    },
    requestsPressed: {
        backgroundColor: colors.cargoPressed,
    },
    count: {
        minWidth: 28,
        height: 28,
        paddingHorizontal: spacing.xs + 2,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.asphalt,
    },
});
