import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { container } from "../../../di/container";
import { ActiveTrip } from "../../../domain/models/ClientRequestResponse";
import { Amount, AppText, Card, SegmentedTabs, StateView, StatusPill } from "../../components/ui";
import { cargoCategoryLabel, vehicleLabel } from "../../utils/Cargo";
import { formatScheduledDate } from "../../utils/Formatters";
import { colors, spacing } from "../../theme";
import TripPlaces from "../trip/components/TripPlaces";
import { UpcomingTab, UpcomingTripsViewModel } from "./UpcomingTripsViewModel";

// Búsquedas y viajes en curso o programados del usuario, como cliente o como conductor
export function UpcomingTripsScreen() {

    const viewModel: UpcomingTripsViewModel = container.resolve("upcomingTripsViewModel");
    const navigation = useNavigation<any>();
    const [trips, setTrips] = useState<ActiveTrip[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<UpcomingTab | null>(null);
    // El cliente puede pedir un flete desde aquí; el conductor no tiene esa pantalla en su menú
    const canRequest = navigation.getState()?.routeNames?.includes('ClientMapStackNavigator') ?? false;

    const load = async () => {
        const response = await viewModel.getMyActiveTrips();
        if (Array.isArray(response)) {
            setTrips(response);
            setFailed(false);
        } else {
            setFailed(true);
        }
    }

    const refresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }

    useFocusEffect(useCallback(() => {
        load();
    }, []));

    const openTrip = (trip: ActiveTrip) => {
        if (trip.role === 'CLIENT') {
            if (trip.status === 'CREATED') {
                navigation.navigate('ClientMapStackNavigator', { screen: 'ClientSearchMapScreen', params: { idClientRequest: trip.id } });
            } else {
                navigation.navigate('ClientMapStackNavigator', { screen: 'ClientTripMapScreen', params: { idClientRequest: trip.id, idDriver: trip.id_driver_assigned } });
            }
        } else {
            navigation.navigate('DriverMapStackNavigator', { screen: 'DriverTripMapScreen', params: { idClientRequest: trip.id } });
        }
    }

    if (trips === null) {
        return (
            <View style={styles.screen}>
                {failed
                    ? <StateView kind="error" message="No pudimos cargar tus fletes." onAction={refresh} />
                    : <StateView kind="loading" />}
            </View>
        );
    }

    const { active, scheduled } = viewModel.split(trips);
    // Sin elegir, se abre la pestaña que tiene algo, empezando por lo que está en curso
    const shownTab: UpcomingTab = tab ?? (active.length > 0 || scheduled.length === 0 ? 'ACTIVE' : 'SCHEDULED');
    const shown = shownTab === 'ACTIVE' ? active : scheduled;

    return (
        <View style={styles.screen}>
            <View style={styles.tabs}>
                <SegmentedTabs
                    options={[
                        { value: 'ACTIVE' as UpcomingTab, label: `En curso${active.length ? ` (${active.length})` : ''}` },
                        { value: 'SCHEDULED' as UpcomingTab, label: `Programados${scheduled.length ? ` (${scheduled.length})` : ''}` },
                    ]}
                    selected={shownTab}
                    onSelect={setTab}
                />
            </View>
            <FlatList
                data={shown}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.asphalt]} />}
                renderItem={({ item }) => {
                    const status = viewModel.status(item);
                    return (
                        <Card onPress={() => openTrip(item)} accessibilityLabel={`Abrir el flete a ${item.destination_description}`}>
                            <View style={styles.top}>
                                <View style={styles.flex}>
                                    <AppText variant="smallStrong" color={item.scheduled_at ? 'text' : 'textMuted'}>
                                        {item.scheduled_at ? formatScheduledDate(item.scheduled_at) : 'Ahora'}
                                    </AppText>
                                    <Amount value={item.fare_assigned ?? item.fare_offered} />
                                </View>
                                <StatusPill label={status.label} tone={status.tone} />
                            </View>
                            <TripPlaces pickup={item.pickup_description} destination={item.destination_description} pickupDone={item.status === 'TRAVELING'} />
                            <AppText variant="small" color="textMuted">
                                {cargoCategoryLabel(item.cargo_category)} · {vehicleLabel(item.required_vehicle)}{item.role === 'DRIVER' ? ' · Lo llevas tú' : ''}
                            </AppText>
                        </Card>
                    );
                }}
                ListEmptyComponent={
                    shownTab === 'SCHEDULED'
                        ? <StateView
                            kind="empty"
                            icon="calendar-outline"
                            title="No tienes fletes programados"
                            message={canRequest ? 'Al pedir un flete elige "Programar" y aparece aquí con su fecha.' : 'Los fletes que aceptes para otro día aparecen aquí con su fecha.'}
                            actionLabel={canRequest ? 'Pedir un flete' : undefined}
                            onAction={canRequest ? () => navigation.navigate('ClientMapStackNavigator', { screen: 'ClientSearchMapScreen' }) : undefined}
                        />
                        : <StateView
                            kind="empty"
                            icon="cube-outline"
                            title="No tienes fletes en curso"
                            message={canRequest ? 'Cuando pidas un flete, aquí lo sigues.' : 'Cuando un cliente acepte tu oferta, el viaje aparece aquí.'}
                            actionLabel={canRequest ? 'Pedir un flete' : undefined}
                            onAction={canRequest ? () => navigation.navigate('ClientMapStackNavigator', { screen: 'ClientSearchMapScreen' }) : undefined}
                        />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    tabs: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    list: {
        flexGrow: 1,
        padding: spacing.lg,
        gap: spacing.md,
    },
    top: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    flex: {
        flex: 1,
    },
});
