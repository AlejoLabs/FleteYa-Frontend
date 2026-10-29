import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { Photo } from "../../../../domain/models/Photo";
import { Amount, AppText, Button, Card, Notice, PersonRow, useToast } from "../../../components/ui";
import CargoInfo from "../../../components/CargoInfo";
import PhotoStrip from "../../../components/PhotoStrip";
import { formatCOP, formatErrorMessage } from "../../../utils/Formatters";
import { spacing } from "../../../theme";
import TripPlaces from "../../trip/components/TripPlaces";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import CounterOfferDialog from "./CounterOfferDialog";

interface Props {
    clientRequestResponse: ClientRequestResponse;
    viewModel: DriverClientRequestViewModel;
    idDriver: number;
    // Recarga la lista después de ofertar o descartar
    onChanged: () => void;
}

// Una solicitud cercana: cuánto ofrece el cliente, qué tan lejos está, la ruta, la carga y las tres respuestas posibles
export function DriverClientRequestItem({ clientRequestResponse: request, viewModel, idDriver, onChanged }: Props) {
    const { showToast } = useToast();
    const clientFare = request.fare_offered;
    const myOffer = request.my_offer ?? null;
    const cargoPhotos = request.cargo_photos ?? 0;
    const [isOfferVisible, setIsOfferVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);
    // Las fotos se piden solo cuando el conductor quiere verlas, para no cargar todas las de la lista
    const [photos, setPhotos] = useState<Photo[] | null>(null);

    const togglePhotos = async () => {
        if (photos) {
            setPhotos(null);
            return;
        }
        const response = await viewModel.getTripPhotos(request.id);
        if (Array.isArray(response)) setPhotos(response);
        else showToast(formatErrorMessage(response.message), 'error');
    }

    const sendOffer = async (fare: number) => {
        if (isSending) return;
        setIsSending(true);
        const response = await viewModel.sendOffer(idDriver, request, fare);
        setIsSending(false);
        if ('id_client_request' in response) {
            setIsOfferVisible(false);
            showToast(`Oferta de ${formatCOP(fare)} enviada`, 'success');
            onChanged();
        } else {
            showToast(formatErrorMessage(response.message), 'error');
        }
    }

    const handleDismiss = async () => {
        const response = await viewModel.dismissClientRequest(request.id);
        if (response === true) {
            showToast('No volverás a ver esta solicitud', 'info');
            onChanged();
        } else {
            showToast(formatErrorMessage((response as ErrorResponse).message), 'error');
        }
    }

    return (
        <Card>
            <View style={styles.top}>
                <Amount value={clientFare} size="lg" />
                <AppText variant="small" color="textMuted" align="right" style={styles.distance}>
                    {viewModel.arrivalText(request)}
                </AppText>
            </View>

            {myOffer !== null &&
                <Notice tone="success" message={`Tu oferta: ${formatCOP(myOffer)} · esperando al cliente`} />}

            <TripPlaces pickup={request.pickup_description} destination={request.destination_description} pickupDone={false} />
            <CargoInfo request={request} />
            {cargoPhotos > 0 &&
                <View style={styles.photos}>
                    <Button
                        title={photos ? 'Ocultar fotos' : `Ver fotos de la carga (${cargoPhotos})`}
                        icon="images-outline"
                        variant="text"
                        size="sm"
                        onPress={togglePhotos}
                        style={styles.photosButton}
                    />
                    {photos && <PhotoStrip items={photos.map((photo) => ({ key: String(photo.id), path: photo.url }))} />}
                </View>
            }
            <PersonRow
                name={`${request.client.name} ${request.client.lastname}`}
                subtitle="Cliente"
                imageUri={request.client.image}
                rating={request.client.rating}
            />

            <View style={styles.actions}>
                <Button title={`Aceptar por ${formatCOP(clientFare)}`} loading={isSending && !isOfferVisible} onPress={() => sendOffer(clientFare)} />
                <View style={styles.row}>
                    <View style={styles.flex}>
                        <Button title={myOffer !== null ? 'Cambiar oferta' : 'Contraofertar'} variant="secondary" onPress={() => setIsOfferVisible(true)} />
                    </View>
                    <View style={styles.flex}>
                        <Button title="No me interesa" variant="text" onPress={handleDismiss} />
                    </View>
                </View>
            </View>

            <CounterOfferDialog
                visible={isOfferVisible}
                clientFare={clientFare}
                myOffer={myOffer}
                sending={isSending}
                onSend={sendOffer}
                onClose={() => setIsOfferVisible(false)}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    distance: {
        flex: 1,
    },
    photos: {
        gap: spacing.xs,
    },
    photosButton: {
        alignSelf: 'flex-start',
    },
    actions: {
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    flex: {
        flex: 1,
    },
});
