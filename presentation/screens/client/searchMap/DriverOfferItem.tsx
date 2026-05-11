import { Image, StyleSheet, Text, View } from "react-native";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { Client } from "../../../../domain/models/ClientRequestResponse";
import { ClientSearchMapViewModel } from "./ClientSearchMapViewModel";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";

interface Props {
    viewModel: ClientSearchMapViewModel;
    driverTripOffer: DriverTripOffer;
    navigation: StackNavigationProp<ClientMapStackParamList, 'ClientSearchMapScreen', undefined>;
    cargo?: {
        description: string;
        weight_kg: number;
        length_cm: number;
        width_cm: number;
        height_cm: number;
    };
}

export function DriverOfferItem({ viewModel, driverTripOffer, navigation, cargo }: Props) {

    const handleUpdateDriverAssigned = async () => {
            const response = await viewModel.updateDriverAssigned(
                driverTripOffer.id_client_request, 
                driverTripOffer.id_driver, 
                driverTripOffer.fare_offered
            );
            if (response === true || (response as any)?.id_driver_assigned === driverTripOffer.id_driver) {
                viewModel.emitNewDriverAssigned(driverTripOffer.id_client_request, driverTripOffer.id_driver);
                console.log('CONDUCTOR ASIGNADO CORRECTAMENTE');
                navigation.navigate('ClientTripMapScreen', {
                    idClientRequest: driverTripOffer.id_client_request,      
                });
            }
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Image
                    source={{ uri: driverTripOffer.driver?.image }}
                    style={styles.imageDriver}
                />
                <View style={styles.infoDriver}>
                    <Text>Marca de vehiculos</Text>
                    <Text>{driverTripOffer.driver?.name} {driverTripOffer.driver?.lastname}</Text>
                    <Text>5.0</Text>
                </View>
                <View>
                    <Text style={styles.price}>{driverTripOffer.fare_offered.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Text>
                    <Text style={styles.time}>{Math.round(driverTripOffer.time)} Min</Text>
                    <Text style={styles.distance}>{driverTripOffer.distance.toFixed(2)} Km</Text>
                </View>
            </View>
            <View style={styles.rowButtons}>
                <DefaultRoundedButton
                    text="Rechazar"
                    onPress={() => {}}
                    backgroundColor="red"
                    width={'50%'}
                    height={45}
                />
                <DefaultRoundedButton
                    text="Aceptar"
                    onPress={() => {
                        handleUpdateDriverAssigned();
                    }}
                    backgroundColor="green"
                    width={'50%'}
                    height={45}
                />
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '95%',
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 2,
        marginTop: 10,
        alignSelf: 'center',
        paddingBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: 20,
        alignItems: 'center',
    },
    imageDriver: {
        height: 50,
        width: 50,
        borderRadius: 50
    },
    infoDriver: {
        marginLeft: 10,
        flex: 1,
    },
    rowButtons: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 10,
    },
    price: {
        color: 'green',
        fontSize: 22,
        fontWeight: 'bold'
    },
    time: {
        fontWeight: 'bold'
    },
    distance: {
        fontWeight: 'bold'
    },
    cargoInfo: {
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderTopWidth: 2,
        borderTopColor: '#ddd',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    cargoText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
        marginVertical: 4,
    }
})