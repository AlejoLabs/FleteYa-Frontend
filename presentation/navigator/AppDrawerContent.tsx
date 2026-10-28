import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

export const AppDrawerContent = (props: DrawerContentComponentProps) => {

    const { removeAuthSession } = useAuth();

    const handleLogout = async () => {
        await removeAuthSession();
        // El drawer vive dentro del stack principal: se reinicia ese stack para que "atrás" no regrese a la sesión cerrada
        props.navigation.getParent()?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'LoginScreen' }] })
        );
    }

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <DrawerItem
                label="Cerrar sesión"
                icon={({ size }) => <Ionicons name="exit-outline" size={size} color="#C2362B" />}
                labelStyle={{ color: '#C2362B' }}
                onPress={handleLogout}
            />
        </DrawerContentScrollView>
    )
}
