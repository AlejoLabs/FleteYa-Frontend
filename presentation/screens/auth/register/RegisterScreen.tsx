import { View, Text, Image, TouchableOpacity, Alert, Platform } from "react-native";
import styles from "./Styles";
import DefaultTextInput from "../../../components/DefaultTextInput";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { useState } from "react";
import EmailValidator from "../../../utils/EmailValidator";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { container } from "../../../../di/container";
import { RegisterViewModel } from "./RegisterViewModel";


interface Props extends StackScreenProps<RootStackParamList, 'RegisterScreen'> { };
export default function RegisterScreen({ navigation, route }: Props) {

    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const registerViewModel: RegisterViewModel = container.resolve('registerViewModel');

    const handleRegister = () => {
        if (name === "") {
            Alert.alert("Error", "El nombre no puede estar vacio")
        }
        if (lastname === "") {
            Alert.alert("Error", "El apellido no puede estar vacio")
        }
        if (email === "") {
            Alert.alert("Error", "El correo no puede estar vacio")
        }
        if (phone === "") {
            Alert.alert("Error", "El telefono no puede estar vacio")
        }
        if (password === "") {
            Alert.alert("Error", "El password no puede estar vacio")
        }
        if (confirmPassword === "") {
            Alert.alert("Error", "La confirmacion no puede estar vacia")
        }
        if (!EmailValidator(email)) {
            Alert.alert("Error", "El email no es valido")
        }
        if (confirmPassword !== password) {
            Alert.alert("Error", "Las contraseñas no coinciden")
        }

        const response = registerViewModel.register({
            name: name,
            lastname: lastname,
            email: email,
            phone: phone,
            password: password
        });
        console.log('Register response', response);

    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style = {{flex: 1}}
            >

            <ScrollView 
                contentContainerStyle = {{flexGrow: 1}}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles.container}>
                    <Image
                        source={require('../../../../assets/city.jpg')}
                        style={styles.imageBackground}
                    />
                    <View style={styles.form}>
                        <TouchableOpacity onPress={() => navigation.pop()}>
                            <Image
                                style={styles.back}
                                source={require('../../../../assets/left_arrow.png')}
                            />
                        </TouchableOpacity>

                        <Image
                            source={require('../../../../assets/user.png')}
                            style={styles.imageUser}
                        />
                        <Text style={styles.textRegister}>REGISTRO</Text>

                        <DefaultTextInput
                            placeholder="Nombre"
                            value={name}
                            onChangeText={setName}
                            icon={require('../../../../assets/user.png')}
                        />

                        <DefaultTextInput
                            placeholder="Apellido"
                            value={lastname}
                            onChangeText={setLastname}
                            icon={require('../../../../assets/user_image.png')}
                        />

                        <DefaultTextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            icon={require('../../../../assets/email.png')}
                        />

                        <DefaultTextInput
                            placeholder="Telefono"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="number-pad"
                            icon={require('../../../../assets/phone.png')}
                        />

                        <DefaultTextInput
                            placeholder="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            icon={require('../../../../assets/password.png')}
                            secureTextEntry={true}
                        />

                        <DefaultTextInput
                            placeholder="Confirmar Contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            icon={require('../../../../assets/password.png')}
                            secureTextEntry={true}
                        />

                        <DefaultRoundedButton
                            text="REGISTRARSE"
                            backgroundColor="black"
                            onPress={() => handleRegister()}

                        />

                    </View>
                </View>
            </ScrollView>

        </KeyboardAvoidingView>

    );
}