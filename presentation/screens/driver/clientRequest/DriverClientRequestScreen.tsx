import { View, Text, FlatList } from "react-native";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import { container } from "../../../../di/container";
import { useEffect, useState } from "react";
import styles from "./Styles";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverClientRequestItem } from "./DriverClientRequestItem";
import { useAuth } from "../../../hooks/useAuth";

export function DriverClientRequestScreen() {

    const viewModel = container.resolve('driverClientRequestViewModel');
    const [clientRequestResponse, setClientRequestResponse] = useState<ClientRequestResponse[]>([]);
    const { authResponse } = useAuth();

    useEffect(() => {
        handleGetNearbyTripRequest();
    }, []);

    const handleGetNearbyTripRequest = async () => {
        if (authResponse?.user.id! !== null) {
            const driverPosition = await viewModel.getDriverPosition(authResponse?.user.id!);
            if ('id_driver' in driverPosition) {
                console.log('Driver Position', driverPosition);
                const response = await viewModel.getNearbyTripRequest({
                    latitude: driverPosition.lat,
                    longitude: driverPosition.lng
                });
                setClientRequestResponse(response as ClientRequestResponse[]);
                console.log('Response', response);
            }

        }

    }
    return (
        <View style={styles.container}>
            <FlatList
                data={clientRequestResponse}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <DriverClientRequestItem clientRequestResponse={item} />}

            />
        </View>
    )
}