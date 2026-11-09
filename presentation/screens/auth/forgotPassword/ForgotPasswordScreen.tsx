import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { container } from "../../../../di/container";
import { AppHeader, AppText, Button, CodeInput, KeyboardArea, Notice, TextField, useToast } from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { formatCountdown, formatErrorMessage } from "../../../utils/Formatters";
import { CODE_LENGTH, RESEND_WAIT_SECONDS, ResetErrors } from "./ForgotPasswordViewModel";
import { useTranslation } from 'react-i18next';
import { t } from '../../../../i18n';

interface Props extends StackScreenProps<RootStackParamList, 'ForgotPasswordScreen'> { };

// Dos pasos: pedir el código al correo y luego escribirlo con la contraseña nueva
export default function ForgotPasswordScreen({ navigation, route }: Props) {
    const { t } = useTranslation();

    const viewModel = container.resolve('forgotPasswordViewModel');
    const { showToast } = useToast();
    const [email, setEmail] = useState(route.params?.email ?? '');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<ResetErrors>({});
    const [isSending, setIsSending] = useState(false);
    const [resendIn, setResendIn] = useState(0);

    useEffect(() => {
        if (resendIn <= 0) return;
        const timer = setTimeout(() => setResendIn(resendIn - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendIn]);

    const handleSendCode = async () => {
        const problem = viewModel.validateEmail(email);
        setEmailError(problem);
        if (problem) return;
        setIsSending(true);
        const response = await viewModel.sendCode(email);
        setIsSending(false);
        if ('statusCode' in response) {
            showToast(formatErrorMessage(response.message), 'error');
            return;
        }
        setCodeSent(true);
        setResendIn(RESEND_WAIT_SECONDS);
        showToast(t('forgotPassword.teEnviamosElCodigo'), 'success');
    }

    const handleReset = async () => {
        const problems = viewModel.validateReset(code, password);
        setErrors(problems);
        if (Object.keys(problems).length > 0) return;
        setIsSending(true);
        const response = await viewModel.resetPassword(email, code, password);
        setIsSending(false);
        if ('statusCode' in response) {
            // Casi siempre es el código: vencido o mal escrito
            setErrors({ code: formatErrorMessage(response.message) });
            return;
        }
        showToast(t('forgotPassword.contrasenaCambiadaYaPuedesEntrar'), 'success');
        navigation.goBack();
    }

    // En el paso 2, volver es corregir el correo; en el paso 1, regresar al login
    const handleBack = () => {
        if (!codeSent) {
            navigation.goBack();
            return;
        }
        setCodeSent(false);
        setCode('');
        setErrors({});
    }

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader
                title={t('forgotPassword.recuperarContrasena')}
                onBack={handleBack}
                right={<AppText variant="caption" color="textMuted">{codeSent ? t('forgotPassword.t2De2') : t('forgotPassword.t1De2')}</AppText>}
            />
            <KeyboardArea aboveBottomInset style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {!codeSent ?
                        <>
                            <View style={styles.intro}>
                                <AppText variant="title">{t('forgotPassword.aQueCorreoTeEnviamos')}</AppText>
                                <AppText variant="body" color="textMuted">
                                    {t('forgotPassword.usaElCorreoDeTu')}
                                </AppText>
                            </View>
                            <TextField
                                label={t('common.correo')}
                                icon="mail-outline"
                                placeholder={t('common.correoEjemplo')}
                                value={email}
                                onChangeText={(value) => { setEmail(value); setEmailError(null); }}
                                error={emailError}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                returnKeyType="send"
                                onSubmitEditing={handleSendCode}
                            />
                        </>
                        :
                        <>
                            <View style={styles.intro}>
                                <AppText variant="title">{t('forgotPassword.escribeElCodigoQueTe')}</AppText>
                                <AppText variant="body" color="textMuted">{t('forgotPassword.loMandamosAVenceEn', { maskEmail: viewModel.maskEmail(email) })}</AppText>
                            </View>
                            <CodeInput
                                label={t('forgotPassword.codigo')}
                                length={CODE_LENGTH}
                                value={code}
                                onChangeText={(value) => { setCode(value); setErrors({ ...errors, code: undefined }); }}
                                error={errors.code}
                                autoFocus
                            />
                            <TextField
                                label={t('forgotPassword.nuevaContrasena')}
                                placeholder={t('common.minimo6Caracteres')}
                                value={password}
                                onChangeText={(value) => { setPassword(value); setErrors({ ...errors, password: undefined }); }}
                                error={errors.password}
                                secureTextEntry
                                autoComplete="new-password"
                                returnKeyType="done"
                                onSubmitEditing={handleReset}
                            />
                            <Notice
                                message={resendIn > 0
                                    ? t('forgotPassword.noTeLlegoRevisaLa', { countdown: formatCountdown(resendIn * 1000) })
                                    : t('forgotPassword.noTeLlegoRevisaLa2')}
                                actionLabel={resendIn > 0 || isSending ? undefined : t('forgotPassword.pedirOtroCodigo')}
                                onAction={handleSendCode}
                            />
                        </>
                    }
                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        title={codeSent ? t('common.cambiarContrasena') : t('forgotPassword.enviarCodigo')}
                        loading={isSending}
                        onPress={codeSent ? handleReset : handleSendCode}
                    />
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
        gap: spacing.lg,
        padding: spacing.lg,
    },
    intro: {
        gap: spacing.sm,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
});
