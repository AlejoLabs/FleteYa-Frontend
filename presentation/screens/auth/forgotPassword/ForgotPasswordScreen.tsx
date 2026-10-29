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

interface Props extends StackScreenProps<RootStackParamList, 'ForgotPasswordScreen'> { };

// Dos pasos: pedir el código al correo y luego escribirlo con la contraseña nueva
export default function ForgotPasswordScreen({ navigation, route }: Props) {

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
        showToast('Te enviamos el código', 'success');
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
        showToast('Contraseña cambiada. Ya puedes entrar con ella', 'success');
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
                title="Recuperar contraseña"
                onBack={handleBack}
                right={<AppText variant="caption" color="textMuted">{codeSent ? '2 de 2' : '1 de 2'}</AppText>}
            />
            <KeyboardArea aboveBottomInset style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {!codeSent ?
                        <>
                            <View style={styles.intro}>
                                <AppText variant="title">¿A qué correo te enviamos el código?</AppText>
                                <AppText variant="body" color="textMuted">
                                    Usa el correo de tu cuenta. Si la creaste con Google, así también puedes ponerle una contraseña.
                                </AppText>
                            </View>
                            <TextField
                                label="Correo"
                                icon="mail-outline"
                                placeholder="tu@correo.com"
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
                                <AppText variant="title">Escribe el código que te enviamos</AppText>
                                <AppText variant="body" color="textMuted">
                                    Lo mandamos a {viewModel.maskEmail(email)}. Vence en 15 minutos.
                                </AppText>
                            </View>
                            <CodeInput
                                label="Código"
                                length={CODE_LENGTH}
                                value={code}
                                onChangeText={(value) => { setCode(value); setErrors({ ...errors, code: undefined }); }}
                                error={errors.code}
                                autoFocus
                            />
                            <TextField
                                label="Nueva contraseña"
                                placeholder="Mínimo 6 caracteres"
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
                                    ? `¿No te llegó? Revisa la carpeta de spam. Puedes pedir otro en ${formatCountdown(resendIn * 1000)}.`
                                    : '¿No te llegó? Revisa la carpeta de spam o pide otro código.'}
                                actionLabel={resendIn > 0 || isSending ? undefined : 'Pedir otro código'}
                                onAction={handleSendCode}
                            />
                        </>
                    }
                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        title={codeSent ? 'Cambiar contraseña' : 'Enviar código'}
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
