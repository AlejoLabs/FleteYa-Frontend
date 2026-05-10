import { StackScreenProps } from "@react-navigation/stack";
import { Text, View } from "react-native";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";
import { container } from "../../../../di/container";
import { DriverTripMapViewModel } from "./DriverTripMapViewModel";
import { useEffect } from "react";

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverTripMapScreen'> { };
export function DriverTripMapScreen({navigation, route}: Props) {
    const { idClientRequest } = route.params;
    const viewModel: DriverTripMapViewModel = container.resolve("driverTripMapViewModel");

    const handleGetClientRequestById = async () => {
        const response = await viewModel.getClientRequestById(idClientRequest);
        console.log('getClientRequestById', response);
    }

    useEffect(() => {
            handleGetClientRequestById();
    }, []);

    console.log('PARAMETRO CLIENTE', idClientRequest);
    return(
        <View>
            <Text>DriverTripMapScreen</Text>
        </View>
    );
}