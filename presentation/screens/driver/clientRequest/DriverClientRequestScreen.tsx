import { View, Text } from "react-native";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import { container } from "../../../../di/container";
import { useEffect } from "react";

export function DriverClientRequestScreen() {

        const viewModel = container.resolve('driverClientRequestViewModel');

        useEffect(() => {
            handleGetNearbyTripRequest();
        }, []);
        
        const handleGetNearbyTripRequest = async () => {
            const response = await viewModel.getNearbyTripRequest({
                latitude: 4.602070,
                longitude: -74.196558
            });
            console.log('Response', response);
        }
        return (
            <View>
                <Text>DriverClientRequestScreen</Text>
            </View>
        )
}