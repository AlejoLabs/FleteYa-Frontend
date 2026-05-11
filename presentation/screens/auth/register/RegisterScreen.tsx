import { View, Text, Image, TouchableOpacity, Alert, Platform, UIManager } from "react-native";
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
import { Shadow } from "react-native-shadow-2";
import LottieView from "lottie-react-native";


interface Props extends StackScreenProps<RootStackParamList, 'RegisterScreen'> { };
export default function RegisterScreen({ navigation, route }: Props) {

    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const hasLottieNativeView = (() => {
        if (Platform.OS !== 'android') return true;
        try {
            return Boolean(UIManager.getViewManagerConfig?.('LottieAnimationView'))
                || Boolean(UIManager.getViewManagerConfig?.('RCTLottieAnimationView'));
        } catch {
            return false;
        }
    })();

    const registerViewModel: RegisterViewModel = container.resolve('registerViewModel');

    const handleRegister = async () => {
        if (name.trim() === "") {
            Alert.alert("Error", "El nombre no puede estar vacio");
            return;
        }
        if (lastname.trim() === "") {
            Alert.alert("Error", "El apellido no puede estar vacio");
            return;
        }
        if (email.trim() === "") {
            Alert.alert("Error", "El correo no puede estar vacio");
            return;
        }
        if (phone.trim() === "") {
            Alert.alert("Error", "El telefono no puede estar vacio");
            return;
        }
        if (password === "") {
            Alert.alert("Error", "El password no puede estar vacio");
            return;
        }
        if (confirmPassword === "") {
            Alert.alert("Error", "La confirmacion no puede estar vacia");
            return;
        }
        if (!EmailValidator(email.trim())) {
            Alert.alert("Error", "El email no es valido");
            return;
        }
        if (confirmPassword !== password) {
            Alert.alert("Error", "Las contraseñas no coinciden");
            return;
        }

        const response = await registerViewModel.register({
            name: name.trim(),
            lastname: lastname.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password: password
        });

        if ('token' in response) {
            Alert.alert(
                'Exito',
                'Usuario creado exitosamente',
                [{ text: 'OK', onPress: () => navigation.replace('LoginScreen') }]
            );
            return;
        }

        const errorMessage = Array.isArray(response.message)
            ? response.message.join(', ')
            : response.message;
        Alert.alert('Error', errorMessage);
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles.container}>
                    <Image
                        source={require('../../../../assets/city.jpg')}
                        style={styles.ImageBackground}
                    />
                    <Image
                        style={styles.topImage}
                        source={require('../../../../assets/city_background.jpg')}
                    />

                    <TouchableOpacity
                        style={styles.containerBack}
                        onPress={() => navigation.pop()}>
                        <Image
                            style={styles.back}
                            source={require('../../../../assets/left_arrow.png')}
                        />
                    </TouchableOpacity>

                    <Shadow containerStyle={styles.shadowForm} distance={15} startColor={'#717171'} >
                        {<View style={styles.form}>
                            {hasLottieNativeView ? (
                                <LottieView style={styles.lottie} source={require('../../../../assets/sign_in.json')} autoPlay loop />
                            ) : (
                                <Text style={{ color: '#fff', marginBottom: 12 }}>Cargando animacion...</Text>
                            )}


                            <DefaultTextInput
                                placeholder="Nombre"
                                value={name}
                                onChangeText={setName}
                                icon={require('../../../../assets/user.png')}
                                placeholderTextColor="gray"
                                marginHorizontal={15}
                                textColor="gray"
                            />

                            <DefaultTextInput
                                placeholder="Apellido"
                                value={lastname}
                                onChangeText={setLastname}
                                icon={require('../../../../assets/user_image.png')}
                                placeholderTextColor="gray"
                                marginHorizontal={15}
                                textColor="gray"
                            />

                            <DefaultTextInput
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                icon={require('../../../../assets/email.png')}
                                placeholderTextColor="gray"
                                marginHorizontal={15}
                                textColor="gray"
                            />

                            <DefaultTextInput
                                placeholder="Telefono"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="number-pad"
                                icon={require('../../../../assets/phone.png')}
                                placeholderTextColor="gray"
                                marginHorizontal={15}
                                textColor="gray"
                            />

                            <DefaultTextInput
                                placeholder="Contraseña"
                                value={password}
                                onChangeText={setPassword}
                                icon={require('../../../../assets/password.png')}
                                secureTextEntry={true}
                                placeholderTextColor="gray"
                                marginHorizontal={15}
                                textColor="gray"
                            />

                            <DefaultTextInput
                                placeholder="Confirmar Contraseña"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                icon={require('../../../../assets/password.png')}
                                secureTextEntry={true}
                                placeholderTextColor="gray"
                                marginHorizontal={15}
                                textColor="gray"
                            />

                            <DefaultRoundedButton
                                text="Crear Usuario"
                                onPress={() => {
                                    handleRegister();
                                }}
                                backgroundColor="orange"
                                marginTop={15}
                                height={50}
                                marginLeft={15}
                                width={260}
                            />

                        </View>}
                    </Shadow>

                    {/*<View style={styles.form}>
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

                    </View>*/}
                </View>
            </ScrollView>

        </KeyboardAvoidingView>

    );
}