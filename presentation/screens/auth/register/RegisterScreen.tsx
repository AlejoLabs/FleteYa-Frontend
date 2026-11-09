import { useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { container } from "../../../../di/container";
import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { useAuth } from "../../../hooks/useAuth";
import { AppHeader, AppText, Button, KeyboardArea, OptionCard, TextField, useToast } from "../../../components/ui";
import { formatErrorMessage } from "../../../utils/Formatters";
import { useGoogleSignIn } from "../google/useGoogleSignIn";
import GoogleLinkDialog from "../google/GoogleLinkDialog";
import { AccountType, RegisterErrors, RegisterForm, RegisterViewModel } from "./RegisterViewModel";
import styles from "./Styles";
import { useTranslation } from 'react-i18next';
import { t } from '../../../../i18n';

interface Props extends StackScreenProps<RootStackParamList, 'RegisterScreen'> { };

const EMPTY_FORM: RegisterForm = { name: '', lastname: '', phone: '', email: '', password: '' };

export default function RegisterScreen({ navigation }: Props) {
    const { t } = useTranslation();

    const registerViewModel: RegisterViewModel = container.resolve('registerViewModel');
    const { saveAuthSession } = useAuth();
    const { showToast } = useToast();

    const [accountType, setAccountType] = useState<AccountType>('CLIENT');
    const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [isSending, setIsSending] = useState(false);
    const lastnameRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    // El login ya decide a dónde ir según el rol al ver la sesión nueva
    const enter = (response: AuthResponse) => {
        navigation.popToTop();
        saveAuthSession(response);
    }
    const google = useGoogleSignIn(enter);

    const update = (field: keyof RegisterForm) => (value: string) => {
        setForm({ ...form, [field]: value });
        setErrors({ ...errors, [field]: undefined });
    }

    const handleRegister = async () => {
        const problems = registerViewModel.validate(form);
        setErrors(problems);
        if (Object.keys(problems).length > 0) return;

        const account = registerViewModel.toAccount(form);
        // "Quiero transportar": la cuenta se crea en el paso siguiente, junto con el vehículo y sus documentos
        if (accountType === 'DRIVER') {
            navigation.navigate('DriverVehicleRegisterScreen', { account });
            return;
        }

        setIsSending(true);
        const response = await registerViewModel.register(account);
        setIsSending(false);
        if ('token' in response) {
            showToast(t('register.cuentaCreadaHola', { name: account.name }), 'success');
            enter(response);
            return;
        }
        showToast(formatErrorMessage(response.message), 'error');
    }

    const isDriver = accountType === 'DRIVER';

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader
                title={t('register.crearCuenta')}
                onBack={() => navigation.goBack()}
                right={isDriver ? <AppText variant="caption" color="textMuted">{t('register.paso1De2')}</AppText> : undefined}
            />
            <KeyboardArea aboveBottomInset style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <AppText variant="label" color="textMuted">{t('register.comoVasAUsarFleteya')}</AppText>
                    <View style={styles.options} accessibilityRole="radiogroup">
                        <OptionCard
                            title={t('register.quieroMoverUnaCarga')}
                            description={t('register.mudanzasMercanciaMaterialesYMas')}
                            selected={!isDriver}
                            onPress={() => setAccountType('CLIENT')}
                        />
                        <OptionCard
                            title={t('register.quieroTransportar')}
                            description={t('register.tengoCarryEstacasFurgonO')}
                            selected={isDriver}
                            onPress={() => setAccountType('DRIVER')}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <TextField
                                label={t('common.nombre')}
                                value={form.name}
                                onChangeText={update('name')}
                                error={errors.name}
                                autoCapitalize="words"
                                autoComplete="name-given"
                                returnKeyType="next"
                                onSubmitEditing={() => lastnameRef.current?.focus()}
                            />
                        </View>
                        <View style={styles.flex}>
                            <TextField
                                ref={lastnameRef}
                                label={t('register.apellido')}
                                value={form.lastname}
                                onChangeText={update('lastname')}
                                error={errors.lastname}
                                autoCapitalize="words"
                                autoComplete="name-family"
                                returnKeyType="next"
                                onSubmitEditing={() => phoneRef.current?.focus()}
                            />
                        </View>
                    </View>
                    <TextField
                        ref={phoneRef}
                        label={t('common.celular')}
                        prefix="+57"
                        placeholder="300 123 4567"
                        value={form.phone}
                        onChangeText={update('phone')}
                        error={errors.phone}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        maxLength={13}
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                    />
                    <TextField
                        ref={emailRef}
                        label={t('common.correo')}
                        placeholder="tu@correo.com"
                        value={form.email}
                        onChangeText={update('email')}
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                    <TextField
                        ref={passwordRef}
                        label={t('register.contrasena')}
                        placeholder={t('common.minimo6Caracteres')}
                        hint={t('register.tocaElOjoParaRevisar')}
                        value={form.password}
                        onChangeText={update('password')}
                        error={errors.password}
                        secureTextEntry
                        autoComplete="new-password"
                        returnKeyType="done"
                        onSubmitEditing={handleRegister}
                    />
                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        title={isDriver ? t('register.siguienteMiVehiculo') : t('register.crearCuenta')}
                        loading={isSending}
                        disabled={google.isBusy}
                        onPress={handleRegister}
                    />
                    {/* Google crea cuentas de cliente; el conductor necesita registrar su vehículo */}
                    {!isDriver &&
                        <Button
                            title={t('register.registrarmeConGoogle')}
                            variant="google"
                            icon="logo-google"
                            loading={google.isBusy && !google.link.visible}
                            disabled={isSending}
                            onPress={google.start}
                        />
                    }
                </View>
            </KeyboardArea>

            <GoogleLinkDialog
                link={google.link}
                loading={google.isBusy}
                onForgotPassword={() => navigation.navigate('ForgotPasswordScreen', { email: form.email })}
            />
        </SafeAreaView>
    );
}
