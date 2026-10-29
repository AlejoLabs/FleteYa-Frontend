import { StyleSheet, View } from "react-native";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { Photo } from "../../../../domain/models/Photo";
import { Status } from "../../../../domain/repository/ClientRequestRepository";
import { Amount, AppText, PersonRow } from "../../../components/ui";
import TripProgress from "../../../components/TripProgress";
import TripActions from "../../../components/TripActions";
import CargoInfo from "../../../components/CargoInfo";
import { getTripFare } from "../../../utils/Formatters";
import { spacing } from "../../../theme";
import TripPlaces from "../../trip/components/TripPlaces";
import { isCargoOnBoard } from "../../trip/TripStatus";
import DeliveryProofSection from "./DeliveryProofSection";

interface Props {
    request: ClientRequestResponse;
    status: string;
    title: string;
    hint: string;
    vehicleText: string;
    photos: Photo[];
    unread: number;
    onChat: () => void;
    onReport: () => void;
}

// Contenido de la hoja del cliente: en qué va el flete, quién lo lleva, el código de entrega, las fotos y la carga
export default function ClientTripSheet({ request, status, title, hint, vehicleText, photos, unread, onChat, onReport }: Props) {
    const { driver } = request;
    return (
        <>
            <TripProgress status={status} />
            <View style={styles.titles}>
                <AppText variant="title" accessibilityRole="header">{title}</AppText>
                <AppText variant="small" color="textMuted" accessibilityLiveRegion="polite">{hint}</AppText>
            </View>

            <PersonRow
                name={`${driver.name} ${driver.lastname}`}
                subtitle={vehicleText}
                imageUri={driver.image}
                rating={driver.rating}
                right={
                    <View style={styles.fare}>
                        <AppText variant="caption" color="textMuted">Acordado</AppText>
                        <Amount value={getTripFare(request)} />
                    </View>
                }
            />
            <TripActions unread={unread} onChat={onChat} onReport={onReport} />

            <DeliveryProofSection
                deliveryCode={status !== Status.FINISHED ? request.delivery_code : null}
                receiverName={request.receiver_name}
                photos={photos}
            />
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
