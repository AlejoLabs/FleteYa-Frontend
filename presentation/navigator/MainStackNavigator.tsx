import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/auth/login/LoginScreen";
import RegisterScreen from "../screens/auth/register/RegisterScreen";
import { AuthProvider } from "../context/AuthContext";
import { useNotificationNavigation } from "../hooks/useNotificationNavigation";
import { container } from "../../di/container";
import RolesScreen from "../screens/roles/RolesScreen";
import ClientHomeScreen from "../screens/client/home/ClientHomeScreen";
import DriverHomeScreen from "../screens/driver/home/DriverHomeScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import ClientSearchMapScreen from "../screens/client/searchMap/ClientSearchMapScreen";
import DriverMyLocationMapScreen from "../screens/driver/MyLocationMap/DriverMyLocationMapScreen";
import ProfileInfoScreen from "../screens/profile/info/ProfileInfoScreen";
import { ProfileStackNavigator } from "./ProfileStackNavigator";
import { DriverClientRequestScreen } from "../screens/driver/clientRequest/DriverClientRequestScreen";
import { ClientMapStackNavigator } from "./ClientMapStackNavigator";
import { DriverMapStackNavigator } from "./DriverMapStackNavigator";
import { ClientTripHistoryScreen } from "../screens/client/tripHistory/ClientTripHistoryScreen";
import { DriverTripHistoryScreen } from "../screens/driver/tripHistory/DriverTripHistoryScreen";
import { DriverCarInfoScreen } from "../screens/driver/carInfo/DriverCarInfoScreen";
import { AppDrawerContent } from "./AppDrawerContent";
import { UpcomingTripsScreen } from "../screens/upcoming/UpcomingTripsScreen";
import ForgotPasswordScreen from "../screens/auth/forgotPassword/ForgotPasswordScreen";
import DriverVehicleRegisterScreen from "../screens/auth/driverVehicle/DriverVehicleRegisterScreen";
import { User } from "../../domain/models/User";
import DesignSystemScreen from "../screens/dev/designSystem/DesignSystemScreen";

export type RootStackParamList = {
    LoginScreen: undefined,
    RegisterScreen: undefined,
    RolesScreen: undefined,
    ClientHomeScreen: undefined,
    DriverHomeScreen: undefined,
    DriverMyLocationMapScreen: undefined,
    ClientSearchMapScreen: undefined,
    ProfileStackNavigator: undefined,
    DriverClientRequestScreen: undefined,
    ClientMapStackNavigator: undefined,
    DriverMapStackNavigator: undefined,
    ClientTripHistoryScreen: undefined,
    DriverTripHistoryScreen: undefined,
    DriverCarInfoScreen: undefined,
    UpcomingTripsScreen: undefined,
    ForgotPasswordScreen: { email?: string } | undefined,
    DriverVehicleRegisterScreen: { account: User },
    DesignSystemScreen: undefined,
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootStackParamList>();

export const MainStackNavigator = () => {
    
    const authUseCases = container.resolve("authUseCases");
    const socketService = container.resolve("socketService");
    const userUseCases = container.resolve("userUseCases");

    return (
        <AuthProvider authUseCases={authUseCases} socketService={socketService} userUseCases={userUseCases}>
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
                    options={{ headerShown: false }}
                    name="ForgotPasswordScreen"
                    component={ForgotPasswordScreen}
                />

                <Stack.Screen
                    // Trae su propio encabezado con "Paso 2 de 2", como el registro
                    options={{ headerShown: false }}
                    name="DriverVehicleRegisterScreen"
                    component={DriverVehicleRegisterScreen}
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

const CLIENT_MAP_SCREENS = ['ClientSearchMapScreen', 'ClientTripMapScreen'];

const ClientDrawerNavigator = () => {
    useNotificationNavigation('CLIENT');
    return (
        <Drawer.Navigator initialRouteName="ClientMapStackNavigator" drawerContent={(props) => <AppDrawerContent {...props} />}>
            {/* Pedir el flete y seguir el viaje son mapas a pantalla completa con su propio botón de menú; el resto del grupo conserva la barra */}
            <Drawer.Screen
                name="ClientMapStackNavigator"
                options={({ route }) => ({
                    title: 'Mi Ubicación',
                    headerShown: !CLIENT_MAP_SCREENS.includes(getFocusedRouteNameFromRoute(route) ?? 'ClientSearchMapScreen'),
                })}
                component={ClientMapStackNavigator}
            />
            <Drawer.Screen name="UpcomingTripsScreen" options={{title:'Próximos fletes'}} component={UpcomingTripsScreen} />
            <Drawer.Screen name="ProfileStackNavigator" options={{title:'Perfil'}} component={ProfileStackNavigator} />
            <Drawer.Screen name="ClientTripHistoryScreen" options={{title:'Historial de Viajes'}} component={ClientTripHistoryScreen} />
            {__DEV__ && <Drawer.Screen name="DesignSystemScreen" options={{title:'Sistema de diseño'}} component={DesignSystemScreen} />}
        </Drawer.Navigator>
    )
}

const DriverDrawerNavigator = () => {
    useNotificationNavigation('DRIVER');
    return (
        <Drawer.Navigator initialRouteName="DriverMyLocationMapScreen" drawerContent={(props) => <AppDrawerContent {...props} />}>
            {/* El inicio trae su propio encabezado oscuro con el menú, lo ganado y la disponibilidad */}
            <Drawer.Screen name="DriverMyLocationMapScreen" options={{ title: 'Inicio', headerShown: false }} component={DriverMyLocationMapScreen} />
            <Drawer.Screen
                name="DriverMapStackNavigator"
                options={({ route }) => ({
                    title: 'Solicitudes cerca',
                    headerShown: getFocusedRouteNameFromRoute(route) !== 'DriverTripMapScreen',
                })}
                component={DriverMapStackNavigator}
            />
            <Drawer.Screen name="UpcomingTripsScreen" options={{title:'Próximos fletes'}} component={UpcomingTripsScreen} />
            <Drawer.Screen name="DriverTripHistoryScreen" options={{title:'Historial de cargas'}} component={DriverTripHistoryScreen} />
            <Drawer.Screen name="DriverCarInfoScreen" options={{title:'Mi vehículo'}} component={DriverCarInfoScreen} />
            <Drawer.Screen name="ProfileStackNavigator" options={{title:'Perfil'}} component={ProfileStackNavigator} />
            {__DEV__ && <Drawer.Screen name="DesignSystemScreen" options={{title:'Sistema de diseño'}} component={DesignSystemScreen} />}
        </Drawer.Navigator>
    )
}
