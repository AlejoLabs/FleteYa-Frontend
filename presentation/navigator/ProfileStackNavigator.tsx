import { createNativeStackNavigator } from "@react-navigation/native-stack"
import RegisterScreen from "../screens/auth/register/RegisterScreen";
import RolesScreen from "../screens/roles/RolesScreen";
import ClientSearchMapScreen from "../screens/client/searchMap/ClientSearchMapScreen";
import DriverMyLocationMapScreen from "../screens/driver/MyLocationMap/DriverMyLocationMapScreen";
import ProfileInfoScreen from "../screens/profile/info/ProfileInfoScreen";
import ProfileUpdateScreen from "../screens/profile/update/ProfileUpdateScreen";
import ChangePasswordScreen from "../screens/profile/changePassword/ChangePasswordScreen";
import ProfileLanguageScreen from "../screens/profile/language/ProfileLanguageScreen";

export type ProfileStackParamList = {
    ProfileInfoScreen: undefined,
    ProfileUpdateScreen: undefined,
    ChangePasswordScreen: undefined,
    ProfileLanguageScreen: undefined,
}

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => {

    return (
        <Stack.Navigator>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="ProfileInfoScreen"
                component={ProfileInfoScreen}
            />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="ProfileUpdateScreen"
                component={ProfileUpdateScreen}
            />

            <Stack.Screen
                options={{ headerShown: false }}
                name="ChangePasswordScreen"
                component={ChangePasswordScreen}
            />

            <Stack.Screen
                options={{ headerShown: false }}
                name="ProfileLanguageScreen"
                component={ProfileLanguageScreen}
            />


        </Stack.Navigator>
    )
}
