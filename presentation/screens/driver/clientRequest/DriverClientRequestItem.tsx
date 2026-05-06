import { View, Text, Image } from "react-native";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import styles from "./Styles";

interface Props {
    clientRequestResponse: ClientRequestResponse;
}

export function DriverClientRequestItem({ clientRequestResponse }: Props) {
    return (
        <View style={styles.itemContainer}>
            <View style= {styles.mainInfoContainer}>
                <View style = {styles.mainTextContainer}>
                    <Text style = {styles.textMainInfo}>Tarifa Ofrecida: {clientRequestResponse.fare_offered}</Text>
                    <Text style = {styles.textMainInfo}>Tiempo de llegada: {clientRequestResponse.google_distance_matrix.duration.text}</Text>
                    <Text style = {styles.textMainInfo}>Recorrido: {clientRequestResponse.google_distance_matrix.distance.text}</Text>
                </View>
                <Image
                    style={styles.imageClient}
                    source={{uri: clientRequestResponse.client.image}}
                />
            </View>
            <Text style= {styles.textDataTrip}>Datos del viaje</Text>
            <Text>Recoger en: {clientRequestResponse.pickup_description}</Text>
            <Text>Llevar a: {clientRequestResponse.destination_description}</Text>
            <Text>Cliente: {clientRequestResponse.client.name} {clientRequestResponse.client.lastname}</Text>
        </View>
    )
}