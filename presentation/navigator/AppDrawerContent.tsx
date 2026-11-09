import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { DrawerContentComponentProps, useDrawerStatus } from "@react-navigation/drawer";
import { CommonActions, DrawerActions } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { AppText, Avatar, BrandMark } from "../components/ui";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from 'react-i18next';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Ícono de cada pantalla del menú: el contorno normal y el relleno cuando es la pantalla abierta
const ICONS: Record<string, [IconName, IconName]> = {
    ClientMapStackNavigator: ['package-variant-closed', 'package-variant-closed'],
    DriverMyLocationMapScreen: ['home-outline', 'home'],
    DriverMapStackNavigator: ['format-list-bulleted', 'format-list-bulleted'],
    UpcomingTripsScreen: ['calendar-blank-outline', 'calendar-blank'],
    ClientTripHistoryScreen: ['history', 'history'],
    DriverTripHistoryScreen: ['history', 'history'],
    DriverCarInfoScreen: ['truck-outline', 'truck'],
    ProfileStackNavigator: ['account-circle-outline', 'account-circle'],
};

// Menú lateral en asfalto de arriba abajo: la marca, quién tiene la sesión abierta, las pantallas del rol y cerrar sesión
export const AppDrawerContent = (props: DrawerContentComponentProps) => {
    const { t } = useTranslation();

    const { state, descriptors, navigation } = props;
    const { authResponse, removeAuthSession } = useAuth();
    const insets = useSafeAreaInsets();
    const isOpen = useDrawerStatus() === 'open';
    const user = authResponse?.user;
    // El conductor tiene "Mi vehículo" en su menú; así se sabe con qué rol entró sin guardarlo aparte
    const isDriver = state.routeNames.includes('DriverCarInfoScreen');

    // Igual que el menú de React Navigation: avisa a la pantalla y, si ya está abierta, solo cierra el menú
    const openRoute = (index: number) => {
        const route = state.routes[index];
        const focused = index === state.index;
        const event = navigation.emit({ type: 'drawerItemPress', target: route.key, canPreventDefault: true });
        if (!event.defaultPrevented) {
            navigation.dispatch({ ...(focused ? DrawerActions.closeDrawer() : CommonActions.navigate(route)), target: state.key });
        }
    }

    const handleLogout = async () => {
        await removeAuthSession();
        // El drawer vive dentro del stack principal: se reinicia ese stack para que "atrás" no regrese a la sesión cerrada
        navigation.getParent()?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'LoginScreen' }] })
        );
    }

    return (
        <View style={[styles.screen, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.md }]}>
            {/* Sobre el asfalto los íconos del teléfono van en blanco; al cerrar, cada pantalla vuelve a poner los suyos */}
            {isOpen && <StatusBar style="light" />}
            <View style={styles.header}>
                <BrandMark />
                {user &&
                    <View style={styles.person}>
                        <View style={styles.avatarRing}>
                            <Avatar name={`${user.name} ${user.lastname}`} imageUri={user.image} size={44} />
                        </View>
                        <View style={styles.flex}>
                            <AppText variant="bodyStrong" color="textOnDark" numberOfLines={1}>{user.name} {user.lastname}</AppText>
                            <View style={styles.role}>
                                <AppText variant="caption" style={styles.roleText}>{isDriver ? t('common.conductor') : t('common.cliente')}</AppText>
                            </View>
                        </View>
                    </View>
                }
            </View>

            <ScrollView style={styles.flex} contentContainerStyle={styles.items}>
                {state.routes.map((route, index) => {
                    const focused = index === state.index;
                    const { title } = descriptors[route.key].options;
                    const [icon, iconFocused] = ICONS[route.name] ?? ['circle-outline', 'circle'];
                    return (
                        <Pressable
                            key={route.key}
                            onPress={() => openRoute(index)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: focused }}
                            style={({ pressed }) => [styles.item, focused && styles.itemFocused, pressed && !focused && styles.itemPressed]}
                        >
                            <MaterialCommunityIcons name={focused ? iconFocused : icon} size={24} color={focused ? colors.asphalt : colors.textOnDarkMuted} />
                            <AppText variant="bodyStrong" style={{ color: focused ? colors.asphalt : colors.textOnDark }}>{title ?? route.name}</AppText>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <Pressable
                onPress={handleLogout}
                accessibilityRole="button"
                style={({ pressed }) => [styles.item, styles.logout, pressed && styles.itemPressed]}
            >
                <MaterialCommunityIcons name="logout" size={24} color={colors.dangerOnDark} />
                <AppText variant="bodyStrong" style={{ color: colors.dangerOnDark }}>{t('appDrawerContent.cerrarSesion')}</AppText>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.asphalt,
        paddingHorizontal: spacing.md,
    },
    header: {
        gap: spacing.lg,
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.fieldOnDarkPressed,
    },
    person: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.fieldOnDark,
    },
    avatarRing: {
        padding: 2,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: colors.cargo,
    },
    role: {
        alignSelf: 'flex-start',
        marginTop: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.pill,
        backgroundColor: colors.cargo,
    },
    roleText: {
        color: colors.asphalt,
    },
    flex: {
        flex: 1,
    },
    items: {
        paddingVertical: spacing.md,
        gap: spacing.xs,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 52,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
    },
    itemFocused: {
        backgroundColor: colors.cargo,
    },
    itemPressed: {
        backgroundColor: colors.fieldOnDark,
    },
    logout: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.fieldOnDarkPressed,
        borderRadius: 0,
    },
});
