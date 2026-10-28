import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { container } from "../../../di/container";
import { ActiveTrip } from "../../../domain/models/ClientRequestResponse";
import { cargoCategoryLabel, DRIVER_STATUS_LABELS, vehicleLabel } from "../../utils/Cargo";
import { formatCOP, formatScheduledDate } from "../../utils/Formatters";

// Búsquedas y viajes en curso o programados del usuario, como cliente o como conductor
export function UpcomingTripsScreen() {

    const viewModel = container.resolve("upcomingTripsViewModel");
    const navigation = useNavigation<any>();
    const [trips, setTrips] = useState<ActiveTrip[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const load = async () => {
        setIsLoading(true);
        const response = await viewModel.getMyActiveTrips();
        setIsLoading(false);
        if (Array.isArray(response)) setTrips(response);
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

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={trips}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => openTrip(item)}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.when}>{item.scheduled_at ? formatScheduledDate(item.scheduled_at) : 'Ahora'}</Text>
                            <Text style={styles.status}>{DRIVER_STATUS_LABELS[item.status] ?? item.status}</Text>
                        </View>
                        <Text style={styles.fare}>{formatCOP(item.fare_assigned ?? item.fare_offered)}</Text>
                        <Text numberOfLines={1}>Desde: {item.pickup_description}</Text>
                        <Text numberOfLines={1}>Hasta: {item.destination_description}</Text>
                        <Text style={styles.cargo}>
                            {cargoCategoryLabel(item.cargo_category)} · {vehicleLabel(item.required_vehicle)}
                            {item.role === 'DRIVER' ? ' · Lo llevas tú' : ''}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No tienes fletes en curso ni programados.</Text>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        elevation: 2,
        marginTop: 10,
        marginHorizontal: 15,
        padding: 15,
        borderRadius: 15,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    when: {
        fontWeight: 'bold',
        color: '#6200EE',
    },
    status: {
        color: '#018786',
        fontWeight: 'bold',
    },
    fare: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    cargo: {
        color: 'gray',
        marginTop: 4,
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: 'gray',
    },
});
