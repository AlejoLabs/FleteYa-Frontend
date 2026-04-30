import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/auth/login/LoginScreen";
import RegisterScreen from "../screens/auth/register/RegisterScreen";
import { AuthProvider } from "../context/AuthContext";
import { container } from "../../di/container";
import RolesScreen from "../screens/roles/RolesScreen";
import ClientHomeScreen from "../screens/client/home/ClientHomeScreen";
import DriverHomeScreen from "../screens/driver/home/DriverHomeScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ClientSearchMapScreen from "../screens/client/searchMap/ClientSearchMapScreen";
import DriverMyLocationMapScreen from "../screens/driver/MyLocationMap/DriverMyLocationMapScreen";
import ProfileInfoScreen from "../screens/profile/info/ProfileInfoScreen";
import { ProfileStackNavigator } from "./ProfileStackNavigator";

export type RootStackParamList = {
    LoginScreen: undefined,
    RegisterScreen: undefined,
    RolesScreen: undefined,
    ClientHomeScreen: undefined,
    DriverHomeScreen: undefined,
    DriverMyLocationMapScreen: undefined,
    ClientSearchMapScreen: undefined,
    ProfileStackNavigator: undefined,
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootStackParamList>();

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
                    component={ClientDrawerNavigator}
                />

                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                    name="DriverHomeScreen"
                    component={DriverDrawerNavigator}
                />



            </Stack.Navigator>
        </AuthProvider>
    )
}

const ClientDrawerNavigator = () => {
    return (
        <Drawer.Navigator initialRouteName="ClientSearchMapScreen">
            <Drawer.Screen name="ClientSearchMapScreen" component={ClientSearchMapScreen} />
            <Drawer.Screen name="ProfileStackNavigator" component={ProfileStackNavigator} />
        </Drawer.Navigator>
    )
}

const DriverDrawerNavigator = () => {
    return (
        <Drawer.Navigator initialRouteName="DriverMyLocationMapScreen">
            <Drawer.Screen name="DriverMyLocationMapScreen" component={DriverMyLocationMapScreen} />
        </Drawer.Navigator>
    )
}
