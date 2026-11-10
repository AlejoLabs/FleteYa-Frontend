import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/auth/login/LoginScreen";
import RegisterScreen from "../screens/auth/register/RegisterScreen";
import { AuthProvider } from "../context/AuthContext";
import { useNotificationNavigation } from "../hooks/useNotificationNavigation";
import { container } from "../../di/container";
import RolesScreen from "../screens/roles/RolesScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute, ParamListBase, RouteProp } from "@react-navigation/native";
import { colors, fonts } from "../theme";
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
import { useTranslation } from 'react-i18next';
import { t } from '../../i18n';
import { useCountriesLoader } from "../hooks/useCountries";

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
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootStackParamList>();

export const MainStackNavigator = () => {
    
    const authUseCases = container.resolve("authUseCases");
    const socketService = container.resolve("socketService");
    const userUseCases = container.resolve("userUseCases");
    // Países y monedas: el registro (indicativo), el buscador y los precios los necesitan desde el principio
    useCountriesLoader(container.resolve("countryUseCases"));

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

// Barra del menú lateral con la letra y los colores de FleteYa; el menú marca en amarillo suave la pantalla abierta
const DRAWER_OPTIONS = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerTitleStyle: { fontFamily: fonts.bold, fontSize: 18 },
    // El menú es asfalto de arriba abajo (AppDrawerContent dibuja sus opciones)
    drawerStyle: { backgroundColor: colors.asphalt, width: 304 },
    overlayColor: colors.overlay,
};

// Solo la lista de solicitudes usa la barra del menú; el viaje, el chat, el reporte y la calificación traen la suya
const driverStackOptions = ({ route }: { route: RouteProp<ParamListBase> }) => ({
    title: t('mainStackNavigator.solicitudesCerca'),
    headerShown: (getFocusedRouteNameFromRoute(route) ?? 'DriverClientRequestScreen') === 'DriverClientRequestScreen',
});

// Editar el perfil y cambiar la contraseña traen su propio "Volver"
const profileOptions = ({ route }: { route: RouteProp<ParamListBase> }) => ({
    title: t('mainStackNavigator.perfil'),
    headerShown: (getFocusedRouteNameFromRoute(route) ?? 'ProfileInfoScreen') === 'ProfileInfoScreen',
});

const ClientDrawerNavigator = () => {
    const { t } = useTranslation();
    useNotificationNavigation('CLIENT');
    return (
        <Drawer.Navigator initialRouteName="ClientMapStackNavigator" screenOptions={DRAWER_OPTIONS} drawerContent={(props) => <AppDrawerContent {...props} />}>
            {/* Todas las pantallas del flete traen su propio encabezado: el mapa con el botón de menú y las demás con "Volver" */}
            <Drawer.Screen name="ClientMapStackNavigator" options={{ title: t('mainStackNavigator.pedirUnFlete'), headerShown: false }} component={ClientMapStackNavigator} />
            <Drawer.Screen name="UpcomingTripsScreen" options={{ title: t('mainStackNavigator.proximosFletes') }} component={UpcomingTripsScreen} />
            <Drawer.Screen name="ClientTripHistoryScreen" options={{ title: t('mainStackNavigator.historialDeFletes') }} component={ClientTripHistoryScreen} />
            <Drawer.Screen name="ProfileStackNavigator" options={profileOptions} component={ProfileStackNavigator} />
        </Drawer.Navigator>
    )
}

const DriverDrawerNavigator = () => {
    const { t } = useTranslation();
    useNotificationNavigation('DRIVER');
    return (
        <Drawer.Navigator initialRouteName="DriverMyLocationMapScreen" screenOptions={DRAWER_OPTIONS} drawerContent={(props) => <AppDrawerContent {...props} />}>
            {/* El inicio trae su propio encabezado oscuro con el menú, lo ganado y la disponibilidad */}
            <Drawer.Screen name="DriverMyLocationMapScreen" options={{ title: t('mainStackNavigator.inicio'), headerShown: false }} component={DriverMyLocationMapScreen} />
            <Drawer.Screen name="DriverMapStackNavigator" options={driverStackOptions} component={DriverMapStackNavigator} />
            <Drawer.Screen name="UpcomingTripsScreen" options={{ title: t('mainStackNavigator.proximosFletes') }} component={UpcomingTripsScreen} />
            <Drawer.Screen name="DriverTripHistoryScreen" options={{ title: t('mainStackNavigator.historialDeFletes') }} component={DriverTripHistoryScreen} />
            <Drawer.Screen name="DriverCarInfoScreen" options={{ title: t('mainStackNavigator.miVehiculo') }} component={DriverCarInfoScreen} />
            <Drawer.Screen name="ProfileStackNavigator" options={profileOptions} component={ProfileStackNavigator} />
        </Drawer.Navigator>
    )
}
