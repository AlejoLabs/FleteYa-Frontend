import { View, Text, Image, Modal, Pressable, TouchableOpacity, ToastAndroid } from "react-native";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import styles from "./Styles";
import DefaultTextInput from "../../../components/DefaultTextInput";
import { useState } from "react";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { formatCOP, formatErrorMessage } from "../../../utils/Formatters";

interface Props {
    clientRequestResponse: ClientRequestResponse;
    viewModel: DriverClientRequestViewModel,
    authResponse: AuthResponse | null;
}

export function DriverClientRequestItem({ clientRequestResponse, viewModel, authResponse }: Props) {

    const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
    const [offer, setOffer] = useState<string>("");
    const [sentOffer, setSentOffer] = useState<number | null>(null);
    const [isSending, setIsSending] = useState(false);

    const handleCreateDriverTripOffer = async () => {
        const fare = Number(offer);
        if (offer.trim() === "" || isNaN(fare) || fare <= 0) {
            ToastAndroid.show("Escribe un precio mayor a 0", ToastAndroid.SHORT);
            return;
        }
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
            setSentOffer(fare);
            setOffer("");
            setIsOfferModalVisible(false);
            ToastAndroid.show(`Oferta de ${formatCOP(fare)} enviada`, ToastAndroid.SHORT);
        } else {
            ToastAndroid.show(formatErrorMessage(response.message), ToastAndroid.LONG);
        }
    }

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={() => setIsOfferModalVisible(true)}>
            <View style={styles.mainInfoContainer}>
                <View style={styles.mainTextContainer}>
                    <Text style={styles.textMainInfo}>Tarifa ofrecida: {formatCOP(clientRequestResponse.fare_offered)}</Text>
                    <Text style={styles.textMainInfo}>Llegas en: {clientRequestResponse.google_distance_matrix.duration.text}</Text>
                    <Text style={styles.textMainInfo}>Distancia al cliente: {clientRequestResponse.google_distance_matrix.distance.text}</Text>
                    {
                        sentOffer !== null &&
                        <Text style={[styles.textMainInfo, { color: 'green' }]}>Tu oferta: {formatCOP(sentOffer)}</Text>
                    }
                </View>
                <Image
                    style={styles.imageClient}
                    source={{ uri: clientRequestResponse.client.image }}
                />
            </View>
            <Text style={styles.textDataTrip}>Datos del viaje</Text>
            <Text>Recoger en: {clientRequestResponse.pickup_description}</Text>
            <Text>Llevar a: {clientRequestResponse.destination_description}</Text>
            <Text>Descripción de la carga: {clientRequestResponse.cargo_description}</Text>
            <Text>Medidas: {clientRequestResponse.length_cm} x {clientRequestResponse.width_cm} x {clientRequestResponse.height_cm} cm</Text>
            <Text>Peso: {clientRequestResponse.weight_kg} kg</Text>
            <Text>Cliente: {clientRequestResponse.client.name} {clientRequestResponse.client.lastname}</Text>



            <Modal
                visible={isOfferModalVisible}
                animationType="fade"
                onRequestClose={() => setIsOfferModalVisible(false)}
                transparent={true}
                onShow={() => {
                    /*  placeAutocompleteDestinationRef.current?.setAddressText("");
                     setTimeout(() => {
                         placeAutocompleteDestinationRef.current?.focus();
                     }, 200); */
                }}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsOfferModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={() => { }}>
                        <View style={styles.viewDecoration}>
                            <Text style={styles.textDecoration}>Agrega una oferta</Text>
                        </View>
                        <View style={{ marginLeft: 20 }}>
                            <DefaultTextInput
                                icon={require('../../../../assets/dolar.png')}
                                placeholder="Precio"
                                onChangeText={setOffer}
                                value={offer}
                                keyboardType="numeric"
                                textColor="black"
                                placeholderTextColor="gray"
                            />
                        </View>
                        <View style={{ marginRight: 30, marginLeft: 30 }}>
                            <DefaultRoundedButton
                                onPress={() => {
                                    if (!isSending) handleCreateDriverTripOffer();
                                }}
                                text={isSending ? "Enviando..." : "Enviar oferta"}
                                backgroundColor="black"
                            />
                            <DefaultRoundedButton
                                onPress={() => setOffer(clientRequestResponse.fare_offered.toString())}
                                text={`Usar tarifa del cliente (${formatCOP(clientRequestResponse.fare_offered)})`}
                                backgroundColor="gray"
                                marginTop={12}
                                marginBottom={20}
                            />
                        </View>


                    </Pressable>
                </Pressable>

            </Modal>


        </TouchableOpacity>
    );
}