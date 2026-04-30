import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./Styles";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/useAuth";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { StackScreenProps } from "@react-navigation/stack";
import DefaultTextInput from "../../../components/DefaultTextInput";
import { useState } from "react";
import { ProfileStackParamList } from "../../../navigator/ProfileStackNavigator";

interface Props extends StackScreenProps<ProfileStackParamList, 'ProfileUpdateScreen'> { }
export default function ProfileUpdateScreen({ navigation, route }: Props) {

    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [phone, setPhone] = useState('');
    const { authResponse, removeAuthSession } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.boxBackground}>
                <Text style={styles.textBox}>ACTUALIZAR DATOS</Text>
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
                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Nombre"
                        value={name}
                        onChangeText={setName}
                        icon={require('../../../../assets/user_black.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>
                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Apellido"
                        value={lastname}
                        onChangeText={setLastname}
                        icon={require('../../../../assets/add_user_black.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>
                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Telefono"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="number-pad"
                        icon={require('../../../../assets/phone_black.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>




            </View>
            <View style={styles.viewActions}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconBox}>
                        <Ionicons name='pencil' size={25} color='white' />
                    </View>
                    <Text style={styles.textAction}>EDITAR PERFIL</Text>
                </View>
            </View>
        </View>
    )
}