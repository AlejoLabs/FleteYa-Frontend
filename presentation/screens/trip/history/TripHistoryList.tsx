import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { Amount, AppText, Card, PersonRow, StateView, StatusPill } from "../../../components/ui";
import { formatTripDate, getTripFare } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";
import TripPlaces from "../components/TripPlaces";

type Role = 'CLIENT' | 'DRIVER';

interface Props {
    // Quién mira el historial: el cliente ve al conductor de cada flete y el conductor al cliente
    role: Role;
    load: () => Promise<ClientRequestResponse[] | ErrorResponse>;
}

// Historial de fletes entregados, el más reciente primero. Se recarga al volver a la pantalla y al deslizar hacia abajo
export default function TripHistoryList({ role, load }: Props) {
    const [trips, setTrips] = useState<ClientRequestResponse[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const reload = async () => {
        const response = await load();
        if (Array.isArray(response)) {
            setTrips([...response].sort((a, b) => new Date(b.update_at).getTime() - new Date(a.update_at).getTime()));
            setFailed(false);
        } else {
            setFailed(true);
        }
    }

    const refresh = async () => {
        setRefreshing(true);
        await reload();
        setRefreshing(false);
    }

    useFocusEffect(useCallback(() => {
        reload();
    }, []));

    if (trips === null) {
        return (
            <View style={styles.screen}>
                {failed
                    ? <StateView kind="error" message="No pudimos cargar tu historial." onAction={refresh} />
                    : <StateView kind="loading" message="Cargando tu historial…" />}
            </View>
        );
    }

    return (
        <FlatList
            style={styles.screen}
            contentContainerStyle={styles.list}
            data={trips}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.asphalt]} />}
            renderItem={({ item }) => <TripHistoryCard trip={item} role={role} />}
            ListEmptyComponent={
                <StateView
                    kind="empty"
                    icon="time-outline"
                    title="Todavía no tienes fletes entregados"
                    message={role === 'CLIENT' ? 'Cuando un conductor entregue tu carga, el flete aparece aquí.' : 'Cuando entregues tu primera carga, el flete aparece aquí.'}
                />
            }
        />
    );
}

function TripHistoryCard({ trip, role }: { trip: ClientRequestResponse; role: Role }) {
    const other = role === 'CLIENT' ? trip.driver : trip.client;
    // Las estrellas que esta persona le dio a la otra al terminar
    const myStars = role === 'CLIENT' ? trip.driver_rating : trip.client_rating;
    return (
        <Card>
            <View style={styles.top}>
                <View style={styles.flex}>
                    <AppText variant="small" color="textMuted">{formatTripDate(trip.update_at)}</AppText>
                    <Amount value={getTripFare(trip)} />
                </View>
                <StatusPill label="Entregado" tone="success" />
            </View>
            <TripPlaces pickup={trip.pickup_description} destination={trip.destination_description} pickupDone={false} />
            <PersonRow
                name={`${other.name} ${other.lastname}`}
                subtitle={role === 'CLIENT' ? 'Conductor' : 'Cliente'}
                imageUri={other.image}
                right={typeof myStars === 'number'
                    ? <View style={styles.stars} accessibilityLabel={`Le diste ${myStars} estrellas`}>
                        <Ionicons name="star" size={14} color={colors.star} />
                        <AppText variant="smallStrong">{String(myStars).replace('.', ',')}</AppText>
                    </View>
                    : <AppText variant="caption" color="textMuted">Sin calificar</AppText>}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
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
    stars: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs,
    },
});
