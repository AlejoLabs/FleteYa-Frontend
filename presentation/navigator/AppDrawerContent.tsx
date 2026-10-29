import { StyleSheet, View } from "react-native";
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { AppText, Avatar, BrandMark } from "../components/ui";
import { colors, fonts, radius, spacing } from "../theme";

// Menú lateral: la marca, quién tiene la sesión abierta, las pantallas del rol y cerrar sesión
export const AppDrawerContent = (props: DrawerContentComponentProps) => {

    const { authResponse, removeAuthSession } = useAuth();
    const user = authResponse?.user;
    // El conductor tiene "Mi vehículo" en su menú; así se sabe con qué rol entró sin guardarlo aparte
    const isDriver = props.state.routeNames.includes('DriverCarInfoScreen');

    const handleLogout = async () => {
        await removeAuthSession();
        // El drawer vive dentro del stack principal: se reinicia ese stack para que "atrás" no regrese a la sesión cerrada
        props.navigation.getParent()?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'LoginScreen' }] })
        );
    }

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <BrandMark />
                {user &&
                    <View style={styles.person}>
                        {/* Aro amarillo: las iniciales van sobre asfalto, igual que este encabezado */}
                        <View style={styles.avatarRing}>
                            <Avatar name={`${user.name} ${user.lastname}`} imageUri={user.image} size={48} />
                        </View>
                        <View style={styles.flex}>
                            <AppText variant="bodyStrong" color="textOnDark" numberOfLines={1}>{user.name} {user.lastname}</AppText>
                            <AppText variant="small" color="textOnDarkMuted">{isDriver ? 'Conductor' : 'Cliente'}</AppText>
                        </View>
                    </View>
                }
            </View>
            <View style={styles.items}>
                <DrawerItemList {...props} />
                <DrawerItem
                    label="Cerrar sesión"
                    icon={({ size }) => <Ionicons name="exit-outline" size={size} color={colors.danger} />}
                    labelStyle={styles.logout}
                    style={styles.logoutItem}
                    onPress={handleLogout}
                />
            </View>
        </DrawerContentScrollView>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingTop: 0,
    },
    header: {
        gap: spacing.lg,
        padding: spacing.lg,
        paddingTop: spacing.xxl + spacing.xl,
        backgroundColor: colors.asphalt,
    },
    person: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatarRing: {
        padding: 2,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: colors.cargo,
    },
    flex: {
        flex: 1,
    },
    items: {
        paddingTop: spacing.sm,
    },
    logout: {
        fontFamily: fonts.semibold,
        fontSize: 16,
        color: colors.danger,
    },
    logoutItem: {
        borderRadius: radius.md,
    },
});
