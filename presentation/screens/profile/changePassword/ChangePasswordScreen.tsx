import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { ProfileStackParamList } from "../../../navigator/ProfileStackNavigator";
import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import FormField, { formStyles } from "../../../components/FormField";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { formatErrorMessage } from "../../../utils/Formatters";

interface Props extends StackScreenProps<ProfileStackParamList, 'ChangePasswordScreen'> { };

// Cambiar la contraseña con la sesión abierta. Una cuenta creada con Google no tiene contraseña y aquí la crea
export default function ChangePasswordScreen({ navigation }: Props) {

    const viewModel = container.resolve('changePasswordViewModel');
    const { authResponse } = useAuth();
    // Sesiones guardadas antes de la Fase 4 no traen has_password: se asume que la cuenta tiene contraseña
    const hasPassword = authResponse?.user?.has_password !== false;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSave = async () => {
        const problem = viewModel.validate(hasPassword, currentPassword, newPassword, confirmPassword);
        if (problem) {
            Alert.alert('Revisa los datos', problem);
            return;
        }
        setIsSending(true);
        const response = await viewModel.changePassword(hasPassword, currentPassword, newPassword);
        setIsSending(false);
        if ('statusCode' in response) {
            Alert.alert('No se pudo cambiar', formatErrorMessage(response.message));
            return;
        }
        Alert.alert('Listo', response.message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={formStyles.screen} keyboardShouldPersistTaps="handled">
                <Text style={formStyles.title}>{hasPassword ? 'Cambiar contraseña' : 'Crear contraseña'}</Text>
                <Text style={formStyles.subtitle}>
                    {hasPassword
                        ? 'Por seguridad, primero escribe tu contraseña actual.'
                        : 'Tu cuenta se creó con Google. Con una contraseña también podrás entrar con tu correo.'}
                </Text>

                {hasPassword &&
                    <FormField label="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />}
                <FormField label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Mínimo 6 caracteres" />
                <FormField label="Confirmar nueva contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                <DefaultRoundedButton
                    text={isSending ? 'Guardando...' : 'Guardar contraseña'}
                    backgroundColor="black"
                    onPress={() => { if (!isSending) handleSave(); }}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
