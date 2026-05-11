import { StyleSheet, Text, View, Image } from "react-native";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    clientRequest: ClientRequestResponse;
}

export function ClientTripHistoryItem({ clientRequest }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.rowContainer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.textDescription}>Conductor</Text>
                    <Text style={styles.textValue}>{clientRequest.driver.name} {clientRequest.driver.lastname}</Text>
                </View>
                <Image 
                    style={styles.image}
                    source={{ uri: clientRequest.driver.image}}
                />
            </View>
            <View style={styles.rowContainer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.textDescription}>Desde</Text>
                    <Text style={styles.textValue}>{clientRequest.pickup_description}</Text>
                </View>
                <Ionicons
                    name="location-sharp"
                    size={25}
                />
            </View>
            <View style={styles.rowContainer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.textDescription}>Hasta</Text>
                    <Text style={styles.textValue}>{clientRequest.destination_description}</Text>
                </View>
                <Ionicons
                    name="location-outline"
                    size={25}
                />
            </View>
            <View style={styles.rowContainer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.textDescription}>Tarifa del viaje</Text>
                    <Text style={styles.textValue}>${clientRequest.fare_offered}</Text>
                </View>
                <Ionicons
                    name="cash"
                    size={25}
                />
            </View>
            <View style={styles.rowContainer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.textDescription}>Fecha del Viaje</Text>
                    <Text style={styles.textValue}>{clientRequest.update_at.toLocaleString()}</Text>
                </View>
                <Ionicons
                    name="calendar"
                    size={25}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 290,
        backgroundColor: 'white',
        elevation: 2,
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        marginRight: 30,
        marginLeft: 30,
        marginTop: 10,
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    infoContainer: {
        flex: 1,
    },
    textDescription: {
        fontWeight: 'bold',
    },
    textValue: {
        color: 'gray',
        fontSize: 13,
    }
});