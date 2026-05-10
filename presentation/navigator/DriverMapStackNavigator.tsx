import { createNativeStackNavigator } from "@react-navigation/native-stack"
import DriverMyLocationMapScreen from "../screens/driver/MyLocationMap/DriverMyLocationMapScreen";
import { DriverTripMapScreen } from "../screens/driver/tripMap/DriverTripMapScreen";
import { DriverClientRequestScreen } from "../screens/driver/clientRequest/DriverClientRequestScreen";

export type DriverMapStackParamList = {
    DriverClientRequestScreen: undefined,
    DriverTripMapScreen: { idClientRequest: number }
    
}

const Stack = createNativeStackNavigator<DriverMapStackParamList>();

export const DriverMapStackNavigator = () => {

    return (
        <Stack.Navigator>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="DriverClientRequestScreen"
                component={DriverClientRequestScreen}
            />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="DriverTripMapScreen"
                component={DriverTripMapScreen}
            />


        </Stack.Navigator>
    )
}
