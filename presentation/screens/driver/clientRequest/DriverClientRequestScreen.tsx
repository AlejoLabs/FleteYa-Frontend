import { View, Text, FlatList, ToastAndroid } from "react-native";
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
    const driverPositionRef = useRef<DriverPosition | null>(null);

    const reloadList = async () => {
        const position = driverPositionRef.current;
        if (!position) return;
        const response = await viewModel.getNearbyTripRequest({ latitude: position.lat, longitude: position.lng });
        if (Array.isArray(response)) setClientRequestResponse(response);
    }

    useEffect(() => {
        handleGetNearbyTripRequest();
        handleListenerNewDriverAssigned();
        const offChanged = viewModel.listenerClientRequestsChanged(() => reloadList());
        const offOffer = viewModel.listenerOfferStatus(authResponse?.user.id!, (data) => {
            ToastAndroid.show(
                data.reason === 'OTHER_DRIVER' ? 'El cliente eligió a otro conductor' : 'El cliente rechazó tu oferta; puedes contraofertar',
                ToastAndroid.LONG
            );
            reloadList();
        });
        socketListeners.current.push(offChanged, offOffer);
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
                driverPositionRef.current = driverPosition;
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
                renderItem={({ item }) => <DriverClientRequestItem clientRequestResponse={item} viewModel={viewModel} authResponse={authResponse} onChanged={reloadList} />}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 40, color: 'gray', paddingHorizontal: 30 }}>
                        No hay solicitudes cerca que quepan en tu vehículo. Te avisamos cuando llegue una.
                    </Text>
                }

            />
        </View>
    )
}