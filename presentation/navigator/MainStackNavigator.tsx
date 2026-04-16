import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/auth/login/LoginScreen";
import RegisterScreen from "../screens/auth/register/RegisterScreen";

export type RootStackParamList = {
    LoginScreen: undefined,
    RegisterScreen: undefined,
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export const MainStackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="LoginScreen"
                component={LoginScreen}
            />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="RegisterScreen"
                component={RegisterScreen}
            />
        </Stack.Navigator>
    )

}

