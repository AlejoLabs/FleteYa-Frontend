import { createNativeStackNavigator } from "@react-navigation/native-stack"
import ClientSearchMapScreen from "../screens/client/searchMap/ClientSearchMapScreen";
import { ClientTripMapScreen } from "../screens/client/tripMap/ClientTripMapScreen";
import { ClientRequestResponse } from "../../domain/models/ClientRequestResponse";
import { ClientTripRatingScreen } from "../screens/client/tripRating/ClientTripRating";
import { TripChatScreen } from "../screens/trip/chat/TripChatScreen";
import { IncidentReportScreen } from "../screens/trip/incident/IncidentReportScreen";
import { TripSharedParamList } from "./TripSharedParamList";

export type ClientMapStackParamList = {
    // Con idClientRequest se reabre el panel de una búsqueda en curso (desde "Próximos fletes")
    ClientSearchMapScreen: { idClientRequest?: number } | undefined,
    ClientTripMapScreen: {idClientRequest: number, idDriver: number},
    ClientTripRatingScreen: { clientRequest: ClientRequestResponse },
} & TripSharedParamList

const Stack = createNativeStackNavigator<ClientMapStackParamList>();

export const ClientMapStackNavigator = () => {

    return (
        <Stack.Navigator>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="ClientSearchMapScreen"
                component={ClientSearchMapScreen}
            />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="ClientTripMapScreen"
                component={ClientTripMapScreen}
            />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="ClientTripRatingScreen"
                component={ClientTripRatingScreen}
            />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="TripChatScreen"
                component={TripChatScreen}
            />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="IncidentReportScreen"
                component={IncidentReportScreen}
            />


        </Stack.Navigator>
    )
}
