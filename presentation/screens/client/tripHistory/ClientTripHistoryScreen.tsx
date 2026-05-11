import { Text, View } from "react-native";
import { container } from "../../../../di/container";
import { ClientTripHistoryViewModel } from "./ClientTripHistoryViewModel";
import { useAuth } from "../../../hooks/useAuth";
import { useEffect } from "react";

export function ClientTripHistoryScreen() {

    const viewModel: ClientTripHistoryViewModel = container.resolve("clientTripHistoryViewModel");
    const {authResponse} = useAuth();

    useEffect(() => {
        if (authResponse !== null) {
            handleGetByClientAssigned();
        }
    },[authResponse])
    const handleGetByClientAssigned = async () => {
        if(authResponse !== null){
            const response = await viewModel.getByClientAssigned(authResponse?.user.id!);
            console.log('HISTORIAL DE VIAJES', response);
        }  
    }
    return(
        <View>
            <Text>ClientTripHistoryScreen</Text>
        </View>
    )
}