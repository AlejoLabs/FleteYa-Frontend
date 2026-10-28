import { View, Text, FlatList } from "react-native";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import { container } from "../../../../di/container";
import { useEffect, useRef, useState } from "react";
import styles from "./Styles";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverClientRequestItem } from "./DriverClientRequestItem";
import { useAuth } from "../../../hooks/useAuth";
import { DriverPosition } from "../../../../domain/models/DriverPosition";
import { StackScreenProps } from "@react-navigation/stack";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverClientRequestScreen'> { };

export function DriverClientRequestScreen({navigation, route}: Props) {

    const viewModel = container.resolve('driverClientRequestViewModel');
    const [clientRequestResponse, setClientRequestResponse] = useState<ClientRequestResponse[]>([]);
    const { authResponse } = useAuth();
    const socketListeners = useRef<(() => void)[]>([]);

    useEffect(() => {
        handleGetNearbyTripRequest();
        handleListenerNewDriverAssigned();
        return () => {
            socketListeners.current.forEach((off) => off());
            socketListeners.current = [];
        };
    }, []);

    const handleListenerNewClientRequest = async (driverPosition: DriverPosition) => {
        const off = viewModel.listenerNewClientRequestSocket(async (data: any) => {
                    const response = await viewModel.getNearbyTripRequest({
                        latitude: driverPosition.lat,
                        longitude: driverPosition.lng
                    });
                    setClientRequestResponse(response as ClientRequestResponse[]);
                });
        socketListeners.current.push(off);
    }

    const handleListenerNewDriverAssigned = async () => {
        const off = viewModel.listenerNewDriverAssignedSocket(authResponse?.user.id!, async (data: any) => {
                    const idClientRequest = data.id_client_request;
                    navigation.navigate('DriverTripMapScreen', {
                        idClientRequest: idClientRequest
                    });
                });
        socketListeners.current.push(off);
    }

    const handleGetNearbyTripRequest = async () => {
        if (authResponse?.user.id! !== null) {
            const driverPosition = await viewModel.getDriverPosition(authResponse?.user.id!);
            if ('id_driver' in driverPosition) {
                const response = await viewModel.getNearbyTripRequest({
                    latitude: driverPosition.lat,
                    longitude: driverPosition.lng
                });
                setClientRequestResponse(response as ClientRequestResponse[]);
                handleListenerNewClientRequest(driverPosition);
            }

        }

    }
    return (
        <View style={styles.container}>
            <FlatList
                data={clientRequestResponse}
                keyExtractor={(item) => item.id.toString()}
                // El modal de oferta vive dentro de la lista: sin esto el primer toque en "Enviar oferta" solo cierra el teclado
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => <DriverClientRequestItem clientRequestResponse={item} viewModel={viewModel} authResponse={authResponse} />}

            />
        </View>
    )
}