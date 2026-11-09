import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { container } from "../../../di/container";
import { ActiveTrip } from "../../../domain/models/ClientRequestResponse";
import { Amount, AppText, Card, SegmentedTabs, StateView, StatusPill } from "../../components/ui";
import { cargoCategoryLabel, vehicleLabel } from "../../utils/Cargo";
import { colors, spacing } from "../../theme";
import TripPlaces from "../trip/components/TripPlaces";
import { UpcomingTab, UpcomingTripsViewModel } from "./UpcomingTripsViewModel";
import { useTranslation } from 'react-i18next';

// Búsquedas y viajes en curso o programados del usuario, como cliente o como conductor
export function UpcomingTripsScreen() {
    const { t } = useTranslation();

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
        const stack = trip.role === 'CLIENT' ? 'ClientMapStackNavigator' : 'DriverMapStackNavigator';
        if (trip.status === 'FINISHED') {
            navigation.navigate(stack, { screen: 'TripPaymentScreen', params: { idClientRequest: trip.id } });
            return;
        }
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
                    ? <StateView kind="error" message={t('upcomingTrips.noPudimosCargarTusFletes')} onAction={refresh} />
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
                        { value: 'ACTIVE' as UpcomingTab, label: active.length ? t('upcomingTrips.enCursoConteo', { total: active.length }) : t('upcomingTrips.enCurso') },
                        { value: 'SCHEDULED' as UpcomingTab, label: scheduled.length ? t('upcomingTrips.programadosConteo', { total: scheduled.length }) : t('upcomingTrips.programados') },
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
                        <Card onPress={() => openTrip(item)} accessibilityLabel={t('upcomingTrips.abrirElFleteA', { destination_description: item.destination_description })}>
                            <View style={styles.top}>
                                <View style={styles.flex}>
                                    <AppText variant="smallStrong" color={item.scheduled_at && item.status !== 'FINISHED' ? 'text' : 'textMuted'}>
                                        {viewModel.whenText(item)}
                                    </AppText>
                                    <Amount value={item.fare_assigned ?? item.fare_offered} />
                                </View>
                                <StatusPill label={status.label} tone={status.tone} />
                            </View>
                            <TripPlaces pickup={item.pickup_description} destination={item.destination_description} pickupDone={item.status === 'TRAVELING'} />
                            <AppText variant="small" color="textMuted">
                                {cargoCategoryLabel(item.cargo_category)} · {vehicleLabel(item.required_vehicle)}{item.role === 'DRIVER' ? t('upcomingTrips.loLlevasTu') : ''}
                            </AppText>
                        </Card>
                    );
                }}
                ListEmptyComponent={
                    shownTab === 'SCHEDULED'
                        ? <StateView
                            kind="empty"
                            icon="calendar-outline"
                            title={t('upcomingTrips.noTienesFletesProgramados')}
                            message={canRequest ? t('upcomingTrips.alPedirUnFleteElige') : t('upcomingTrips.losFletesQueAceptesPara')}
                            actionLabel={canRequest ? t('upcomingTrips.pedirUnFlete') : undefined}
                            onAction={canRequest ? () => navigation.navigate('ClientMapStackNavigator', { screen: 'ClientSearchMapScreen' }) : undefined}
                        />
                        : <StateView
                            kind="empty"
                            icon="cube-outline"
                            title={t('upcomingTrips.noTienesFletesEnCurso')}
                            message={canRequest ? t('upcomingTrips.cuandoPidasUnFleteAqui') : t('upcomingTrips.cuandoUnClienteAcepteTu')}
                            actionLabel={canRequest ? t('upcomingTrips.pedirUnFlete') : undefined}
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
