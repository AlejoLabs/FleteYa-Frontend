import { FlatList, Text, View } from "react-native";
import { container } from "../../../../di/container";
import { ClientTripHistoryViewModel } from "./ClientTripHistoryViewModel";
import { useAuth } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { ClientTripHistoryItem } from "./ClientTripHistoryItem";


export function ClientTripHistoryScreen() {

    const viewModel: ClientTripHistoryViewModel = container.resolve("clientTripHistoryViewModel");
    const {authResponse} = useAuth();
    const[clientRequests, setClientRequests] = useState<ClientRequestResponse[]>([]);

    useEffect(() => {
        if (authResponse !== null) {
            handleGetByClientAssigned();
        }
    },[authResponse])
    const handleGetByClientAssigned = async () => {
        if(authResponse !== null){
            const response = await viewModel.getByClientAssigned(authResponse?.user.id!);
            setClientRequests(response as ClientRequestResponse[]);
            console.log('HISTORIAL DE VIAJES', response);
        }  
    }
    return(
        <View style={{flex: 1}}>
            <FlatList 
                data={clientRequests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <ClientTripHistoryItem clientRequest={item} />}
            />
        </View>
    )
}