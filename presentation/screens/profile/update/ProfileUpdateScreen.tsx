import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import styles from "./Styles";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/useAuth";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { StackScreenProps } from "@react-navigation/stack";
import DefaultTextInput from "../../../components/DefaultTextInput";
import { useEffect, useState } from "react";
import { ProfileStackParamList } from "../../../navigator/ProfileStackNavigator";
import * as ImagePicker from 'expo-image-picker';
import { container } from "../../../../di/container";
import { ProfileUpdateViewModel } from "./ProfileUpdateViewModel";

interface Props extends StackScreenProps<ProfileStackParamList, 'ProfileUpdateScreen'> { }
export default function ProfileUpdateScreen({ navigation, route }: Props) {

    const viewModel: ProfileUpdateViewModel = container.resolve('profileUpdateViewModel');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [phone, setPhone] = useState('');
    const { authResponse, removeAuthSession } = useAuth();
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the camera is required.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        if (authResponse != null) {
            setName(authResponse.user.name);
            setLastname(authResponse.user.lastname);
            setPhone(authResponse.user.phone);
        }
    }, [authResponse]);

    return (
        <View style={styles.container}>
            <View style={styles.boxBackground}>
                <Text style={styles.textBox}>ACTUALIZAR DATOS</Text>
            </View>
            <View style={styles.cardUserInfo}>
                <TouchableOpacity onPress={() => {takePhoto();}}>
                    {
                        (authResponse?.user?.image === null && image !== null) ?
                            <Image
                                style={styles.imageUser}
                                source={{ uri: image }}
                            />
                            : <Image
                                style={styles.imageUser}
                                source={require('../../../../assets/user_image.png')}

                            />
                    }
                    {
                        authResponse?.user?.image !== null
                        &&
                        <Image
                            style={styles.imageUser}
                            source={{ uri: authResponse?.user?.image }}
                        />
                    }
                </TouchableOpacity>


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
                <TouchableOpacity style={styles.iconContainer} onPress={() => {
                    viewModel.update({
                        id: authResponse?.user.id!,
                        name: name,
                        lastname: lastname,
                        phone: phone,
                        email: authResponse?.user.email!,
                        image: image ? image : authResponse?.user?.image
                    });
                }}>
                    <View style={styles.iconBox}>
                        <Ionicons name='pencil' size={25} color='white' />
                    </View>
                    <Text style={styles.textAction}>EDITAR PERFIL</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}