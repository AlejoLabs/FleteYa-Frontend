import { StackScreenProps } from "@react-navigation/stack";
import { Text, View } from "react-native";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { container } from "../../../../di/container";
import { ClientTripMapViewModel } from "./ClientTripMapViewModel";
import { useEffect } from "react";

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientTripMapScreen'> { };
export function ClientTripMapScreen({navigation, route}: Props) {
    const { idClientRequest } = route.params;
    const viewModel: ClientTripMapViewModel = container.resolve("clientTripMapViewModel");

    const handleGetClientRequestById = async () => {
        const response = await viewModel.getClientRequestById(idClientRequest);
        console.log('getClientRequestById', response);
    }

    useEffect(() => {
        handleGetClientRequestById();
    }, []);

    console.log('PARAMETRO CONDUCTOR', idClientRequest);
    return(
        <View>
            <Text>ClientTripMapScreen</Text>
        </View>
    )
}