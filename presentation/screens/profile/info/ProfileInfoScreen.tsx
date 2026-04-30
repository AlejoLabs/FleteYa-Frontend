import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./Styles";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/useAuth";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { StackScreenProps } from "@react-navigation/stack";

interface Props extends StackScreenProps<RootStackParamList, 'ProfileInfoScreen'> {}
export default function ProfileInfoScreen({navigation, route}: Props) {

    const {authResponse, removeAuthSession} = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.boxBackground}>
                <Text style={styles.textBox}>PERFIL DE USUARIO</Text>
            </View>
            <View style={styles.cardUserInfo}>
                {
                    authResponse?.user?.image !== null
                    &&
                    <Image 
                    style={styles.imageUser}
                    source={{ uri: authResponse?.user?.image }}
                />
                }
                {
                    authResponse?.user?.image === null
                    &&
                    <Image 
                    style={styles.imageUser}
                    source={require('../../../../assets/user_image.png')}
                
                />
                }
                <Text style={styles.textUsername}>{authResponse?.user?.name} {authResponse?.user?.lastname}</Text>
                <Text style={styles.textEmail}>{authResponse?.user?.email}</Text>
                <Text style={styles.textPhone}>{authResponse?.user?.phone}</Text>
                
            </View>
            <View style={styles.viewActions}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconBox}>
                        <Ionicons name='pencil' size={25} color='white' />
                    </View>
                    <Text style={styles.textAction}>EDITAR PERFIL</Text>
                </View>
                <TouchableOpacity style={styles.iconContainer} onPress={async () => {
                    await removeAuthSession();
                    navigation.replace('LoginScreen');
                }}>
                    <View style={styles.iconBox}>
                        <Ionicons name='exit-outline' size={25} color='white' />
                    </View>
                    <Text style={styles.textAction}>CERRAR SESION</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}