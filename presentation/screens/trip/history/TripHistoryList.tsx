import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { Amount, AppText, Card, PersonRow, StateView, StatusPill } from "../../../components/ui";
import { formatMoney, formatTripDate, getTripFare, formatNumber } from '../../../utils/Formatters';
import { colors, spacing } from "../../../theme";
import TripPlaces from "../components/TripPlaces";
import { useTranslation } from 'react-i18next';
import { t } from '../../../../i18n';

type Role = 'CLIENT' | 'DRIVER';

interface Props {
    // Quién mira el historial: el cliente ve al conductor de cada flete y el conductor al cliente
    role: Role;
    load: () => Promise<ClientRequestResponse[] | ErrorResponse>;
}

// Historial de fletes entregados, el más reciente primero. Se recarga al volver a la pantalla y al deslizar hacia abajo
export default function TripHistoryList({ role, load }: Props) {
    const { t } = useTranslation();
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
                    ? <StateView kind="error" message={t('tripHistoryList.noPudimosCargarTuHistorial')} onAction={refresh} />
                    : <StateView kind="loading" message={t('tripHistoryList.cargandoTuHistorial')} />}
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
                    title={t('tripHistoryList.todaviaNoTienesFletesEntregados')}
                    message={role === 'CLIENT' ? t('tripHistoryList.cuandoUnConductorEntregueTu') : t('tripHistoryList.cuandoEntreguesTuPrimeraCarga')}
                />
            }
        />
    );
}

// El conductor ve lo que le quedó (sin la comisión de FleteYa); el cliente, lo que pagó. Debajo, cómo se pagó
const tripAmounts = (trip: ClientRequestResponse, role: Role) => {
    const fare = getTripFare(trip);
    const method = trip.payment_method === 'WOMPI' ? t('tripHistoryList.pagadoPorLaApp') : t('tripHistoryList.enEfectivo');
    if (role === 'DRIVER' && trip.commission) {
        return { amount: fare - trip.commission, breakdown: t('tripHistoryList.teQuedoFleteComision', { amount: formatMoney(fare, trip.currency), amount2: formatMoney(trip.commission, trip.currency) }), method };
    }
    return { amount: fare, breakdown: null, method };
}

function TripHistoryCard({ trip, role }: { trip: ClientRequestResponse; role: Role }) {
    const { t } = useTranslation();
    const other = role === 'CLIENT' ? trip.driver : trip.client;
    const { amount, breakdown, method } = tripAmounts(trip, role);
    const paid = Boolean(trip.paid_at);
    // Las estrellas que esta persona le dio a la otra al terminar
    const myStars = role === 'CLIENT' ? trip.driver_rating : trip.client_rating;
    return (
        <Card>
            <View style={styles.top}>
                <View style={styles.flex}>
                    <AppText variant="small" color="textMuted">{formatTripDate(trip.update_at)}</AppText>
                    <Amount value={amount} currency={trip.currency} />
                    {breakdown && <AppText variant="caption" color="textMuted">{breakdown}</AppText>}
                    <AppText variant="caption" color="textMuted">{method}</AppText>
                </View>
                {/* Entregado pero sin pagar: el cobro sigue abierto en "Próximos fletes" */}
                <StatusPill label={paid ? t('common.entregado') : t('tripHistoryList.pendienteDePago')} tone={paid ? 'success' : 'warning'} />
            </View>
            <TripPlaces pickup={trip.pickup_description} destination={trip.destination_description} pickupDone={false} />
            <PersonRow
                name={`${other.name} ${other.lastname}`}
                subtitle={role === 'CLIENT' ? t('common.conductor') : t('common.cliente')}
                imageUri={other.image}
                right={typeof myStars === 'number'
                    ? <View style={styles.stars} accessibilityLabel={t('tripHistoryList.leDisteEstrellas', { myStars })}>
                        <Ionicons name="star" size={14} color={colors.star} />
                        <AppText variant="smallStrong">{formatNumber(myStars, 1)}</AppText>
                    </View>
                    : <AppText variant="caption" color="textMuted">{t('tripHistoryList.sinCalificar')}</AppText>}
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
