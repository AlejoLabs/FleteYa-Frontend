import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StackScreenProps } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigator/MainStackNavigator';
import { container } from '../../../../di/container';
import { useAuth } from '../../../hooks/useAuth';
import { AppText, BrandMark, Button, TextField, useToast } from '../../../components/ui';
import { formatErrorMessage } from '../../../utils/Formatters';
import { useGoogleSignIn } from '../google/useGoogleSignIn';
import GoogleLinkDialog from '../google/GoogleLinkDialog';
import { LoginErrors } from './LoginViewModel';
import styles from './Styles';

interface Props extends StackScreenProps<RootStackParamList, 'LoginScreen'> { };

// Inicio de sesión sobre asfalto: correo y contraseña, o Google
export default function LoginScreen({ navigation }: Props) {

  const loginViewModel = container.resolve('loginViewModel');
  const { authResponse, saveAuthSession } = useAuth();
  const { showToast } = useToast();
  const google = useGoogleSignIn(saveAuthSession);
  const isFocused = useIsFocused();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSending, setIsSending] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  // También entra aquí la sesión guardada al abrir la app y la que crean el registro y Google
  useEffect(() => {
    if (authResponse) navigation.replace(loginViewModel.homeRouteFor(authResponse));
  }, [authResponse]);

  const handleLogin = async () => {
    const problems = loginViewModel.validate(email, password);
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;

    setIsSending(true);
    const response = await loginViewModel.login(email, password);
    setIsSending(false);
    if ('token' in response) {
      saveAuthSession(response);
    } else {
      // El mensaje del servidor dice por qué (por ejemplo, que la cuenta se creó con Google)
      showToast(formatErrorMessage(response.message), 'error');
    }
  }

  const goToForgotPassword = () => navigation.navigate('ForgotPasswordScreen', { email });

  return (
    <SafeAreaView style={styles.screen}>
      {/* Solo mientras se ve: registro y recuperar contraseña quedan encima y son blancos */}
      {isFocused && <StatusBar style="light" />}
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <BrandMark />
            <AppText variant="body" color="textOnDarkMuted" style={styles.tagline}>
              Mueve cualquier carga en carry, estacas, furgón o camión. Tú pones el precio.
            </AppText>

            <TextField
              tone="dark"
              label="Correo"
              icon="mail-outline"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={(value) => { setEmail(value); setErrors({ ...errors, email: undefined }); }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <TextField
              ref={passwordRef}
              tone="dark"
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Tu contraseña"
              value={password}
              onChangeText={(value) => { setPassword(value); setErrors({ ...errors, password: undefined }); }}
              error={errors.password}
              secureTextEntry
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            <Pressable onPress={goToForgotPassword} style={styles.forgot} accessibilityRole="link">
              <AppText variant="smallStrong" color="cargo">¿Olvidaste tu contraseña?</AppText>
            </Pressable>

            <Button title="Entrar" loading={isSending} disabled={google.isBusy} onPress={handleLogin} />
            <Button
              title="Continuar con Google"
              variant="onDark"
              icon="logo-google"
              loading={google.isBusy && !google.link.visible}
              disabled={isSending}
              onPress={google.start}
            />
          </View>

          <View style={styles.footer}>
            <AppText variant="body" color="textOnDarkMuted">¿No tienes cuenta?</AppText>
            <Pressable onPress={() => navigation.navigate('RegisterScreen')} hitSlop={12} accessibilityRole="link">
              <AppText variant="bodyStrong" color="cargo">Crear cuenta</AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GoogleLinkDialog link={google.link} loading={google.isBusy} onForgotPassword={goToForgotPassword} />
    </SafeAreaView>
  );
}
