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
import { useTranslation } from 'react-i18next';

interface Props {
    request: ClientRequestResponse;
    status: string;
    title: string;
    hint: string;
    vehicleText: string;
    photos: Photo[];
    deliveryLocked: boolean;
    unread: number;
    onChat: () => void;
    onReport: () => void;
}

// Contenido de la hoja del cliente: en qué va el flete, quién lo lleva, el código de entrega, las fotos y la carga
export default function ClientTripSheet({ request, status, title, hint, vehicleText, photos, deliveryLocked, unread, onChat, onReport }: Props) {
    const { t } = useTranslation();
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
                        <AppText variant="caption" color="textMuted">{t('clientTripSheet.acordado')}</AppText>
                        <Amount value={getTripFare(request)} currency={request.currency} reference />
                    </View>
                }
            />
            <TripActions unread={unread} onChat={onChat} onReport={onReport} />

            <DeliveryProofSection
                deliveryCode={status !== Status.FINISHED ? request.delivery_code : null}
                receiverName={request.receiver_name}
                deliveryLocked={status === Status.TRAVELING && deliveryLocked}
                photos={photos}
            />
            <TripPlaces pickup={request.pickup_description} destination={request.destination_description} pickupDone={isCargoOnBoard(status)} />
            <CargoInfo request={request} showContacts audience="client" />
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
