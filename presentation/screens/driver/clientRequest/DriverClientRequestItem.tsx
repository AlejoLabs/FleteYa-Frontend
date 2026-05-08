import { View, Text, Image, Modal, Pressable, TouchableOpacity } from "react-native";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import styles from "./Styles";
import DefaultTextInput from "../../../components/DefaultTextInput";
import { useState } from "react";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import { AuthResponse } from "../../../../domain/models/AuthResponse";

interface Props {
    clientRequestResponse: ClientRequestResponse;
    viewModel: DriverClientRequestViewModel,
    authResponse: AuthResponse | null;
}

export function DriverClientRequestItem({ clientRequestResponse, viewModel, authResponse }: Props) {

    const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
    const [offer, setOffer] = useState<string>("");

    const handleCreateDriverTripOffer = async () => {
        const response = await viewModel.createDriverTripOffer({
            id_driver: authResponse?.user.id!,
            id_client_request: clientRequestResponse.id,
            fare_offered: Number(offer),
            distance: clientRequestResponse.google_distance_matrix.distance.value / 1000, // Convertir a kilómetros
            time: clientRequestResponse.google_distance_matrix.duration.value / 60 // Convertir a minutos
        });
        console.log('Response Driver Trip Offer', response);
    }

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={() => setIsOfferModalVisible(true)}>
            <View style={styles.mainInfoContainer}>
                <View style={styles.mainTextContainer}>
                    <Text style={styles.textMainInfo}>Tarifa Ofrecida: {clientRequestResponse.fare_offered}</Text>
                    <Text style={styles.textMainInfo}>Tiempo de llegada: {clientRequestResponse.google_distance_matrix.duration.text}</Text>
                    <Text style={styles.textMainInfo}>Recorrido: {clientRequestResponse.google_distance_matrix.distance.text}</Text>
                </View>
                <Image
                    style={styles.imageClient}
                    source={{ uri: clientRequestResponse.client.image }}
                />
            </View>
            <Text style={styles.textDataTrip}>Datos del viaje</Text>
            <Text>Recoger en: {clientRequestResponse.pickup_description}</Text>
            <Text>Llevar a: {clientRequestResponse.destination_description}</Text>
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
                                    console.log('Oferta enviada', offer);
                                    setIsOfferModalVisible(false);
                                    handleCreateDriverTripOffer();

                                }}
                                text="Enviar oferta"
                                backgroundColor="black"
                            />
                        </View>


                    </Pressable>
                </Pressable>

            </Modal>


        </TouchableOpacity>
    );
}