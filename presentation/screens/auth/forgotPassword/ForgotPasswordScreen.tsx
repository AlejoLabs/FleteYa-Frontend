import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { container } from "../../../../di/container";
import FormField, { formStyles } from "../../../components/FormField";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import EmailValidator from "../../../utils/EmailValidator";
import { formatErrorMessage } from "../../../utils/Formatters";

interface Props extends StackScreenProps<RootStackParamList, 'ForgotPasswordScreen'> { };

// Dos pasos: pedir el código al correo y luego escribirlo con la contraseña nueva
export default function ForgotPasswordScreen({ navigation, route }: Props) {

    const viewModel = container.resolve('loginViewModel');
    const [email, setEmail] = useState(route.params?.email ?? '');
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendCode = async () => {
        if (!EmailValidator(email.trim())) {
            Alert.alert('Revisa el correo', 'Escribe un correo válido');
            return;
        }
        setIsSending(true);
        const response = await viewModel.forgotPassword(email.trim());
        setIsSending(false);
        if ('statusCode' in response) {
            Alert.alert('No se pudo enviar', formatErrorMessage(response.message));
            return;
        }
        setCodeSent(true);
        Alert.alert('Revisa tu correo', response.message);
    }

    const handleReset = async () => {
        if (!/^\d{6}$/.test(code.trim())) {
            Alert.alert('Revisa el código', 'El código tiene 6 dígitos');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Contraseña muy corta', 'Usa al menos 6 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Revisa la contraseña', 'Las contraseñas no coinciden');
            return;
        }
        setIsSending(true);
        const response = await viewModel.resetPassword(email.trim(), code.trim(), password);
        setIsSending(false);
        if ('statusCode' in response) {
            Alert.alert('No se pudo cambiar', formatErrorMessage(response.message));
            return;
        }
        Alert.alert('Listo', response.message, [{ text: 'Iniciar sesión', onPress: () => navigation.goBack() }]);
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={formStyles.screen} keyboardShouldPersistTaps="handled">
                <Text style={formStyles.title}>Restablecer contraseña</Text>
                <Text style={formStyles.subtitle}>
                    {codeSent
                        ? `Escribe el código de 6 dígitos que enviamos a ${email.trim()} y tu nueva contraseña. Vence en 15 minutos.`
                        : 'Te enviaremos un código a tu correo. Si tu cuenta se creó con Google, así también puedes crear una contraseña.'}
                </Text>

                <FormField
                    label="Correo"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!codeSent}
                    placeholder="tucorreo@gmail.com"
                />

                {codeSent &&
                    <>
                        <FormField label="Código" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="000000" />
                        <FormField label="Nueva contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres" />
                        <FormField label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                    </>
                }

                <DefaultRoundedButton
                    text={isSending ? 'Enviando...' : codeSent ? 'Cambiar contraseña' : 'Enviar código'}
                    backgroundColor="black"
                    onPress={() => { if (!isSending) (codeSent ? handleReset() : handleSendCode()); }}
                />

                {codeSent &&
                    <TouchableOpacity style={{ alignSelf: 'center', padding: 14 }} onPress={() => { setCodeSent(false); setCode(''); }}>
                        <Text style={{ color: '#555', fontWeight: 'bold' }}>No me llegó: pedir otro código</Text>
                    </TouchableOpacity>
                }
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
