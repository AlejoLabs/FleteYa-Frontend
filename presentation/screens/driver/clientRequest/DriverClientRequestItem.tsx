import { View, Text, Image, Modal, Pressable, TouchableOpacity, ToastAndroid } from "react-native";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import styles from "./Styles";
import { useState } from "react";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { formatCOP, formatErrorMessage } from "../../../utils/Formatters";
import CargoInfo from "../../../components/CargoInfo";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { Photo } from "../../../../domain/models/Photo";
import PhotoStrip from "../../../components/PhotoStrip";

interface Props {
    clientRequestResponse: ClientRequestResponse;
    viewModel: DriverClientRequestViewModel,
    authResponse: AuthResponse | null;
    // Recarga la lista después de ofertar o descartar
    onChanged: () => void;
}

const FARE_STEP = 1000;
const MIN_FARE = 5000;

export function DriverClientRequestItem({ clientRequestResponse, viewModel, authResponse, onChanged }: Props) {

    const clientFare = clientRequestResponse.fare_offered;
    const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
    const [counterFare, setCounterFare] = useState<number>(clientFare);
    const [isSending, setIsSending] = useState(false);
    const myOffer = clientRequestResponse.my_offer ?? null;
    const cargoPhotos = clientRequestResponse.cargo_photos ?? 0;
    // Las fotos se piden solo cuando el conductor quiere verlas, para no cargar todas las de la lista
    const [photos, setPhotos] = useState<Photo[] | null>(null);

    const togglePhotos = async () => {
        if (photos) {
            setPhotos(null);
            return;
        }
        const response = await viewModel.getTripPhotos(clientRequestResponse.id);
        if (Array.isArray(response)) {
            setPhotos(response);
        } else {
            ToastAndroid.show(formatErrorMessage(response.message), ToastAndroid.LONG);
        }
    }

    const sendOffer = async (fare: number) => {
        if (isSending) return;
        setIsSending(true);
        const response = await viewModel.createDriverTripOffer({
            id_driver: authResponse?.user.id!,
            id_client_request: clientRequestResponse.id,
            fare_offered: fare,
            distance: clientRequestResponse.google_distance_matrix.distance.value / 1000, // Convertir a kilómetros
            time: clientRequestResponse.google_distance_matrix.duration.value / 60 // Convertir a minutos
        });
        setIsSending(false);
        if ('id_client_request' in response) {
            viewModel.emitNewDriverOffer(clientRequestResponse.id);
            setIsOfferModalVisible(false);
            ToastAndroid.show(`Oferta de ${formatCOP(fare)} enviada`, ToastAndroid.SHORT);
            onChanged();
        } else {
            ToastAndroid.show(formatErrorMessage(response.message), ToastAndroid.LONG);
        }
    }

    const handleDismiss = async () => {
        const response = await viewModel.dismissClientRequest(clientRequestResponse.id);
        if (response === true) {
            ToastAndroid.show('No volverás a ver esta solicitud', ToastAndroid.SHORT);
            onChanged();
        } else {
            ToastAndroid.show(formatErrorMessage((response as ErrorResponse).message), ToastAndroid.LONG);
        }
    }

    return (
        <View style={styles.itemContainer}>
            <View style={styles.mainInfoContainer}>
                <View style={styles.mainTextContainer}>
                    <Text style={styles.textMainInfo}>{formatCOP(clientFare)}</Text>
                    <Text>Llegas en {clientRequestResponse.google_distance_matrix.duration.text} · {clientRequestResponse.google_distance_matrix.distance.text}</Text>
                    {myOffer !== null &&
                        <Text style={{ color: 'green', fontWeight: 'bold' }}>Tu oferta: {formatCOP(myOffer)} · esperando al cliente</Text>}
                </View>
                <Image
                    style={styles.imageClient}
                    source={{ uri: clientRequestResponse.client.image }}
                />
            </View>
            <Text style={styles.textDataTrip}>Datos del flete</Text>
            <Text>Recoger en: {clientRequestResponse.pickup_description}</Text>
            <Text>Llevar a: {clientRequestResponse.destination_description}</Text>
            <CargoInfo request={clientRequestResponse} />
            {cargoPhotos > 0 &&
                <TouchableOpacity style={{ paddingVertical: 6 }} onPress={togglePhotos}>
                    <Text style={{ color: '#0a66c2', fontWeight: 'bold' }}>
                        {photos ? 'Ocultar fotos' : `Ver fotos de la carga (${cargoPhotos})`}
                    </Text>
                </TouchableOpacity>}
            {photos && <PhotoStrip items={photos.map((photo) => ({ key: String(photo.id), path: photo.url }))} />}
            <Text style={{ marginTop: 2 }}>Cliente: {clientRequestResponse.client.name} {clientRequestResponse.client.lastname}</Text>

            <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'green' }]} onPress={() => sendOffer(clientFare)}>
                    <Text style={styles.actionText}>{isSending ? 'Enviando...' : `Aceptar ${formatCOP(clientFare)}`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: 'black' }]}
                    onPress={() => {
                        setCounterFare(myOffer ?? clientFare + FARE_STEP);
                        setIsOfferModalVisible(true);
                    }}
                >
                    <Text style={styles.actionText}>Contraofertar</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ alignSelf: 'center', paddingTop: 10 }} onPress={handleDismiss}>
                <Text style={{ color: 'gray', fontWeight: 'bold' }}>No me interesa</Text>
            </TouchableOpacity>

            <Modal
                visible={isOfferModalVisible}
                animationType="fade"
                onRequestClose={() => setIsOfferModalVisible(false)}
                transparent={true}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsOfferModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={() => { }}>
                        <View style={styles.viewDecoration}>
                            <Text style={styles.textDecoration}>Tu precio para este flete</Text>
                        </View>
                        <Text style={{ textAlign: 'center', color: 'gray', marginTop: 12 }}>El cliente ofrece {formatCOP(clientFare)}</Text>
                        <View style={styles.stepperRow}>
                            <TouchableOpacity style={styles.stepperButton} onPress={() => setCounterFare((fare) => Math.max(MIN_FARE, fare - FARE_STEP))}>
                                <Text style={styles.stepperText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.counterFare}>{formatCOP(counterFare)}</Text>
                            <TouchableOpacity style={styles.stepperButton} onPress={() => setCounterFare((fare) => fare + FARE_STEP)}>
                                <Text style={styles.stepperText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginHorizontal: 30, marginBottom: 20 }}>
                            <DefaultRoundedButton
                                onPress={() => sendOffer(counterFare)}
                                text={isSending ? "Enviando..." : "Enviar oferta"}
                                backgroundColor="black"
                                marginTop={10}
                            />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
