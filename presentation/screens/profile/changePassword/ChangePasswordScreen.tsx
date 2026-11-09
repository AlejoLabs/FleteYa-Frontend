import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { ProfileStackParamList } from "../../../navigator/ProfileStackNavigator";
import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import { AppHeader, AppText, Button, KeyboardArea, TextField, useToast } from "../../../components/ui";
import { formatErrorMessage } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";
import { ChangePasswordViewModel, PasswordErrors, PasswordForm } from "./ChangePasswordViewModel";
import { useTranslation } from 'react-i18next';

interface Props extends StackScreenProps<ProfileStackParamList, 'ChangePasswordScreen'> { };

// Cambiar la contraseña con la sesión abierta. Una cuenta creada con Google no tiene contraseña y aquí la crea
export default function ChangePasswordScreen({ navigation }: Props) {
    const { t } = useTranslation();

    const viewModel: ChangePasswordViewModel = container.resolve('changePasswordViewModel');
    const { authResponse } = useAuth();
    const { showToast } = useToast();
    // Sesiones guardadas antes de la Fase 4 no traen has_password: se asume que la cuenta tiene contraseña
    const hasPassword = authResponse?.user?.has_password !== false;
    const [form, setForm] = useState<PasswordForm>({ current: '', next: '', confirm: '' });
    const [errors, setErrors] = useState<PasswordErrors>({});
    const [isSending, setIsSending] = useState(false);

    const update = (field: keyof PasswordForm) => (value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    const handleSave = async () => {
        const problems = viewModel.validate(hasPassword, form);
        setErrors(problems);
        if (Object.keys(problems).length > 0) return;
        setIsSending(true);
        const response = await viewModel.changePassword(hasPassword, form.current, form.next);
        setIsSending(false);
        if ('statusCode' in response) {
            showToast(formatErrorMessage(response.message), 'error');
            return;
        }
        showToast(response.message, 'success');
        navigation.goBack();
    }

    const title = hasPassword ? t('common.cambiarContrasena') : t('changePassword.crearContrasena');

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader title={title} onBack={() => navigation.goBack()} />
            <KeyboardArea style={styles.flex} aboveBottomInset>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <AppText variant="body" color="textMuted">
                        {hasPassword
                            ? t('changePassword.porSeguridadPrimeroEscribeTu')
                            : t('changePassword.tuCuentaSeCreoCon')}
                    </AppText>
                    {hasPassword &&
                        <TextField label={t('changePassword.contrasenaActual')} value={form.current} onChangeText={update('current')} error={errors.current} secureTextEntry autoComplete="current-password" />}
                    <TextField label={t('changePassword.contrasenaNueva')} placeholder={t('common.minimo6Caracteres')} value={form.next} onChangeText={update('next')} error={errors.next} secureTextEntry autoComplete="new-password" />
                    <TextField label={t('changePassword.repiteLaContrasenaNueva')} value={form.confirm} onChangeText={update('confirm')} error={errors.confirm} secureTextEntry autoComplete="new-password" />
                </ScrollView>
                <View style={styles.footer}>
                    <Button title={t('changePassword.guardarContrasena')} loading={isSending} onPress={handleSave} />
                </View>
            </KeyboardArea>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flex: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
