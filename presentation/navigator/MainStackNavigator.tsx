import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/auth/login/LoginScreen";
import RegisterScreen from "../screens/auth/register/RegisterScreen";
import { AuthProvider } from "../context/AuthContext";
import { container } from "../../di/container";
import RolesScreen from "../screens/roles/RolesScreen";
import ClientHomeScreen from "../screens/client/home/ClientHomeScreen";
import DriverHomeScreen from "../screens/driver/home/DriverHomeScreen";

export type RootStackParamList = {
    LoginScreen: undefined,
    RegisterScreen: undefined,
    RolesScreen: undefined,
    ClientHomeScreen: undefined,
    DriverHomeScreen: undefined,
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export const MainStackNavigator = () => {
    
    const authUseCases = container.resolve("authUseCases");
    
    return (
        <AuthProvider authUseCases={authUseCases}>
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

                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                    name="RolesScreen"
                    component={RolesScreen}
                />

                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                    name="ClientHomeScreen"
                    component={ClientHomeScreen}
                />

                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                    name="DriverHomeScreen"
                    component={DriverHomeScreen}
                />



            </Stack.Navigator>
        </AuthProvider>
    )
}
