import { ScrollView, StyleSheet, View } from "react-native";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../hooks/useAuth";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { ProfileStackParamList } from "../../../navigator/ProfileStackNavigator";
import { AppText, Avatar, Card, ListItem } from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from "../../../../i18n/languages";

interface Props extends StackScreenProps<ProfileStackParamList, 'ProfileInfoScreen'> {}

// Perfil: quién es, sus datos de contacto y las acciones de la cuenta
export default function ProfileInfoScreen({ navigation }: Props) {
    const { t, i18n } = useTranslation();

    const rootNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { authResponse, removeAuthSession } = useAuth();
    const user = authResponse?.user;
    // El menú del conductor tiene "Mi vehículo": así se sabe con qué rol entró
    const isDriver = navigation.getParent()?.getState()?.routeNames?.includes('DriverCarInfoScreen') ?? false;
    const hasBothRoles = (user?.roles?.length ?? 0) > 1;

    const handleLogout = async () => {
        await removeAuthSession();
        rootNavigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'LoginScreen' }] }));
    }

    if (!user) return null;

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.person}>
                {/* El parámetro t obliga a descargar la foto nueva después de cambiarla */}
                <Avatar name={`${user.name} ${user.lastname}`} imageUri={user.image ? `${user.image}?t=${user.update_at}` : null} size={88} />
                <AppText variant="title" align="center">{user.name} {user.lastname}</AppText>
                <AppText variant="small" color="textMuted">{isDriver ? t('common.conductor') : t('common.cliente')}</AppText>
            </View>

            <View style={styles.section}>
                <AppText variant="label" color="textMuted">{t('profileInfo.tusDatos')}</AppText>
                <Card style={styles.card}>
                    <ListItem icon="mail-outline" title={user.email} subtitle={t('common.correo')} />
                    <ListItem icon="call-outline" title={user.phone ? `+57 ${user.phone}` : t('profileInfo.sinCelular')} subtitle={t('common.celular')} />
                </Card>
            </View>

            <Card style={styles.card}>
                <ListItem icon="create-outline" title={t('profileInfo.editarPerfil')} subtitle={t('profileInfo.nombreCelularYFoto')} onPress={() => navigation.navigate('ProfileUpdateScreen')} />
                <ListItem
                    icon="key-outline"
                    // Una cuenta creada con Google no tiene contraseña: aquí la crea
                    title={user.has_password === false ? t('profileInfo.crearContrasena') : t('common.cambiarContrasena')}
                    onPress={() => navigation.navigate('ChangePasswordScreen')}
                />
                <ListItem
                    icon="language-outline"
                    title={t('profileInfo.idioma')}
                    subtitle={LANGUAGES.find((language) => language.code === i18n.language)?.nativeName}
                    onPress={() => navigation.navigate('ProfileLanguageScreen')}
                />
                {hasBothRoles &&
                    <ListItem
                        icon="swap-horizontal-outline"
                        title={isDriver ? t('profileInfo.cambiarACliente') : t('profileInfo.cambiarAConductor')}
                        subtitle={t('profileInfo.tienesLosDosRoles')}
                        onPress={() => rootNavigation.replace(isDriver ? 'ClientHomeScreen' : 'DriverHomeScreen')}
                    />
                }
            </Card>

            <Card style={styles.card}>
                <ListItem icon="exit-outline" title={t('profileInfo.cerrarSesion')} tone="danger" onPress={handleLogout} showChevron={false} />
            </Card>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.xl,
    },
    person: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    section: {
        gap: spacing.sm,
    },
    card: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        gap: 0,
    },
});
