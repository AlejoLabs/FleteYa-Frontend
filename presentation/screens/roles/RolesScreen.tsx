import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigator/MainStackNavigator";
import { useAuth } from "../../hooks/useAuth";
import { AppText } from "../../components/ui";
import RolesItem from "./RolesItem";
import styles from "./Styles";

interface Props extends StackScreenProps<RootStackParamList, 'RolesScreen'> { };

// Solo llega aquí quien tiene cuenta de cliente y de conductor
export default function RolesScreen({ navigation }: Props) {

    const { authResponse } = useAuth();

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.intro}>
                    <AppText variant="title">Hola, {authResponse?.user.name}</AppText>
                    <AppText variant="body" color="textMuted">¿Qué vas a hacer hoy?</AppText>
                </View>
                {authResponse?.user.roles?.map((role) => (
                    <RolesItem
                        key={role.id}
                        role={role}
                        onPress={() => navigation.replace(role.id === 'DRIVER' ? 'DriverHomeScreen' : 'ClientHomeScreen')}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
