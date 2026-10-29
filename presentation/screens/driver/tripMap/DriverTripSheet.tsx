import { StyleSheet, View } from "react-native";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { Amount, AppText, Notice, PersonRow } from "../../../components/ui";
import TripProgress from "../../../components/TripProgress";
import TripActions from "../../../components/TripActions";
import CargoInfo from "../../../components/CargoInfo";
import { getTripFare } from "../../../utils/Formatters";
import { spacing } from "../../../theme";
import TripPlaces from "../../trip/components/TripPlaces";
import { isCargoOnBoard } from "../../trip/TripStatus";

interface Props {
    request: ClientRequestResponse;
    status: string;
    title: string;
    hint: string;
    unread: number;
    locationUnavailable: boolean;
    onChat: () => void;
    onReport: () => void;
}

// Contenido de la hoja del conductor: en qué paso va, el cliente, el pago acordado, las direcciones y la carga
export default function DriverTripSheet({ request, status, title, hint, unread, locationUnavailable, onChat, onReport }: Props) {
    const { client } = request;
    return (
        <>
            <TripProgress status={status} />
            <View style={styles.titles}>
                <AppText variant="title" accessibilityRole="header">{title}</AppText>
                {hint ? <AppText variant="small" color="textMuted">{hint}</AppText> : null}
            </View>
            {locationUnavailable &&
                <Notice tone="warning" message="No tenemos tu ubicación: el cliente no te ve en el mapa. Actívala en los ajustes del teléfono." />}

            <PersonRow
                name={`${client.name} ${client.lastname}`}
                subtitle="Cliente"
                imageUri={client.image}
                rating={client.rating}
                right={
                    <View style={styles.fare}>
                        <AppText variant="caption" color="textMuted">Acordado</AppText>
                        <Amount value={getTripFare(request)} />
                    </View>
                }
            />
            <TripActions unread={unread} onChat={onChat} onReport={onReport} />

            <TripPlaces pickup={request.pickup_description} destination={request.destination_description} pickupDone={isCargoOnBoard(status)} />
            <CargoInfo request={request} showContacts />
        </>
    );
}

const styles = StyleSheet.create({
    titles: {
        gap: spacing.xxs,
    },
    fare: {
        alignItems: 'flex-end',
    },
});
