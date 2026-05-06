import { View, Text, FlatList } from "react-native";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import { container } from "../../../../di/container";
import { useEffect, useState } from "react";
import styles from "./Styles";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverClientRequestItem } from "./DriverClientRequestItem";

export function DriverClientRequestScreen() {

        const viewModel = container.resolve('driverClientRequestViewModel');
        const [clientRequestResponse, setClientRequestResponse] = useState<ClientRequestResponse[]>([]);

        useEffect(() => {
            handleGetNearbyTripRequest();
        }, []);

        const handleGetNearbyTripRequest = async () => {
            const response = await viewModel.getNearbyTripRequest({
                latitude: 4.602070,
                longitude: -74.196558
            });
            setClientRequestResponse(response as ClientRequestResponse[]);
            console.log('Response', response);
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