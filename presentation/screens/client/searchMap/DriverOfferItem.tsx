import { Image, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { ClientSearchMapViewModel } from "./ClientSearchMapViewModel";
import { StackNavigationProp } from "@react-navigation/stack";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { useState } from "react";
import { formatCOP, formatErrorMessage, formatRating } from "../../../utils/Formatters";
import { vehicleLabel } from "../../../utils/Cargo";

interface Props {
    viewModel: ClientSearchMapViewModel;
    driverTripOffer: DriverTripOffer;
    navigation: StackNavigationProp<ClientMapStackParamList, 'ClientSearchMapScreen', undefined>;
    // Se llama después de aceptar o rechazar, para que el panel actualice la lista
    onResolved: (accepted: boolean) => void;
}

export function DriverOfferItem({ viewModel, driverTripOffer, navigation, onResolved }: Props) {

    const [isBusy, setIsBusy] = useState(false);

    const handleUpdateDriverAssigned = async () => {
        if (isBusy) return;
        setIsBusy(true);
        const response = await viewModel.updateDriverAssigned(
            driverTripOffer.id_client_request,
            driverTripOffer.id_driver,
            driverTripOffer.fare_offered
        );
        setIsBusy(false);
        if (response === true || (response as any)?.id_driver_assigned === driverTripOffer.id_driver) {
            viewModel.emitNewDriverAssigned(driverTripOffer.id_client_request, driverTripOffer.id_driver);
            onResolved(true);
            navigation.navigate('ClientTripMapScreen', {
                idClientRequest: driverTripOffer.id_client_request,
                idDriver: driverTripOffer.id_driver,
            });
        } else {
            ToastAndroid.show(formatErrorMessage((response as any).message), ToastAndroid.LONG);
            onResolved(false);
        }
    }

    const handleReject = async () => {
        if (isBusy) return;
        setIsBusy(true);
        const response = await viewModel.rejectDriverTripOffer(driverTripOffer.id!);
        setIsBusy(false);
        if (response !== true) {
            ToastAndroid.show(formatErrorMessage((response as any).message), ToastAndroid.LONG);
        }
        onResolved(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Image
                    source={{ uri: driverTripOffer.driver?.image }}
                    style={styles.imageDriver}
                />
                <View style={styles.infoDriver}>
                    <Text style={styles.name}>{driverTripOffer.driver?.name} {driverTripOffer.driver?.lastname}</Text>
                    <Text style={styles.rating}>{formatRating(driverTripOffer.driver?.rating)}</Text>
                    <Text>{vehicleLabel(driverTripOffer.car?.vehicle_type)}{driverTripOffer.car ? ` · ${driverTripOffer.car.brand}` : ''}</Text>
                </View>
                <View>
                    <Text style={styles.price}>{formatCOP(driverTripOffer.fare_offered)}</Text>
                    <Text style={styles.time}>Llega en {Math.round(driverTripOffer.time)} min</Text>
                    <Text style={styles.distance}>{driverTripOffer.distance.toFixed(1)} km</Text>
                </View>
            </View>
            <View style={styles.rowButtons}>
                <DefaultRoundedButton
                    text="Rechazar"
                    onPress={handleReject}
                    backgroundColor="red"
                    width={'48%'}
                    height={45}
                    marginTop={10}
                />
                <DefaultRoundedButton
                    text={isBusy ? "..." : "Aceptar"}
                    onPress={handleUpdateDriverAssigned}
                    backgroundColor="green"
                    width={'48%'}
                    height={45}
                    marginTop={10}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 2,
        marginTop: 10,
        paddingVertical: 12,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: 14,
        alignItems: 'center',
    },
    imageDriver: {
        height: 50,
        width: 50,
        borderRadius: 50,
        backgroundColor: '#eee',
    },
    infoDriver: {
        marginLeft: 10,
        flex: 1,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    rating: {
        color: '#b45309',
        fontWeight: 'bold',
    },
    rowButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 14,
    },
    price: {
        color: 'green',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    time: {
        textAlign: 'right',
    },
    distance: {
        textAlign: 'right',
        color: 'gray',
    },
})
