import { FlatList, View } from "react-native";
import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverTripHistoryViewModel } from "./DriverTripHistoryViewModel";
import { DriverTripHistoryItem } from "./DriverTripHistoryItem";


export function DriverTripHistoryScreen() {

    const viewModel: DriverTripHistoryViewModel = container.resolve("driverTripHistoryViewModel");
    const {authResponse} = useAuth();
    const[clientRequests, setClientRequests] = useState<ClientRequestResponse[]>([]);

    useEffect(() => {
        if (authResponse !== null) {
            handleGetByDriverAssigned();
        }
    },[authResponse])
    const handleGetByDriverAssigned = async () => {
        if(authResponse !== null){
            const response = await viewModel.getByDriverAssigned(authResponse?.user.id!);
            setClientRequests(response as ClientRequestResponse[]);
            console.log('HISTORIAL DE VIAJES', response);
        }  
    }
    return(
        <View style={{flex: 1}}>
            <FlatList 
                data={clientRequests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <DriverTripHistoryItem clientRequest={item} />}
            />
        </View>
    )
}