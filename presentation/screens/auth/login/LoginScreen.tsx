import { StyleSheet, Text, View, Image, TextInput, Button, TouchableOpacity, Alert, Platform, UIManager } from 'react-native';
import DefaultTextInput from '../../../components/DefaultTextInput';
import DefaultRoundedButton from '../../../components/DefaultRoundedButton';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigator/MainStackNavigator';
import styles from './Styles';
import { useEffect, useState } from 'react';
import EmailValidator from '../../../utils/EmailValidator';
import { ApiRequestHandler } from '../../../../data/sources/remote/api/ApiRequestHandler';
import { AuthResponse } from '../../../../domain/models/AuthResponse';
import { defaultErrorResponse, ErrorResponse } from '../../../../domain/models/ErrorResponse';
import { LoginUseCase } from '../../../../domain/useCases/auth/LoginUseCase';
import { AuthService } from '../../../../data/sources/remote/services/AuthService';
import { AuthRespositoryImpl } from '../../../../data/repository/AuthRepositoryImpl';
import { LoginViewModel } from './LoginViewModel';
import { container } from '../../../../di/container';
import { useAuth } from '../../../hooks/useAuth';
import { Shadow } from 'react-native-shadow-2';
import LottieView from 'lottie-react-native';
import { formatErrorMessage } from '../../../utils/Formatters';
import { getGoogleIdToken } from '../../../utils/GoogleAuth';
import { Modal } from 'react-native';

interface Props extends StackScreenProps<RootStackParamList, 'LoginScreen'> { };
export default function LoginScreen({ navigation, route }: Props) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleBusy, setIsGoogleBusy] = useState(false);
  // Token de Google pendiente de vincular a una cuenta que ya existía con ese correo
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkPassword, setLinkPassword] = useState('');

  const loginViewModel = container.resolve('loginViewModel');
  const { authResponse, saveAuthSession } = useAuth();
  const hasLottieNativeView = (() => {
    if (Platform.OS !== 'android') return true;
    try {
      return Boolean(UIManager.getViewManagerConfig?.('LottieAnimationView'))
        || Boolean(UIManager.getViewManagerConfig?.('RCTLottieAnimationView'));
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (authResponse !== null && authResponse !== undefined) {
      if (authResponse.user.roles!.length > 1) {
        navigation.replace('RolesScreen');
      }
      // Con un solo rol se entra directo; un conductor recién registrado solo tiene DRIVER
      else if (authResponse.user.roles?.[0]?.id === 'DRIVER') {
        navigation.replace('DriverHomeScreen');
      }
      else {
        navigation.replace('ClientHomeScreen');
      }
    }

  }, [authResponse]);

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'El email y el password no pueden estar vacios')
      return;
    }
    if (!EmailValidator(email)) {
      Alert.alert('Error', 'El email no es valido')
      return;
    }
    const response = await loginViewModel.login(email, password);
    if ('token' in response) { //LOGIN EXITOSO

      saveAuthSession(response);
    } else {
      // Antes un login fallido no mostraba nada; el mensaje del servidor dice por qué (por ejemplo, cuenta de Google)
      Alert.alert('No pudimos iniciar sesión', formatErrorMessage(response.message));
    }
  }

  const handleGoogleLogin = async () => {
    if (isGoogleBusy) return;
    setIsGoogleBusy(true);
    const google = await getGoogleIdToken();
    if (!google.ok) {
      setIsGoogleBusy(false);
      if (!google.cancelled) Alert.alert('Google', google.message);
      return;
    }
    const response = await loginViewModel.loginWithGoogle(google.idToken);
    setIsGoogleBusy(false);
    if ('token' in response) {
      saveAuthSession(response);
    } else if (response.code === 'LINK_REQUIRED') {
      // El correo ya tiene cuenta con contraseña: se pide una vez para vincular Google a esa cuenta
      setLinkToken(google.idToken);
    } else {
      Alert.alert('No pudimos entrar con Google', formatErrorMessage(response.message));
    }
  }

  const handleLinkGoogle = async () => {
    if (!linkToken || linkPassword === '') return;
    setIsGoogleBusy(true);
    const response = await loginViewModel.linkGoogle(linkToken, linkPassword);
    setIsGoogleBusy(false);
    if ('token' in response) {
      setLinkToken(null);
      setLinkPassword('');
      Alert.alert('Cuenta vinculada', 'Desde ahora puedes entrar con Google o con tu contraseña');
      saveAuthSession(response);
    } else {
      Alert.alert('No se pudo vincular', formatErrorMessage(response.message));
    }
  }


  return (

    <View style={styles.container}>

      <Image
        style={styles.ImageBackground}
        source={require('../../../../assets/city_black.jpg')}
      />

      <Image
        style={styles.topImage}
        source={require('../../../../assets/city_background.jpg')}
      />
      <Shadow containerStyle={styles.shadowForm} distance={15} startColor={'#717171'} >
        {<View style={styles.form}>
          {hasLottieNativeView ? (
            <LottieView style={styles.lottie} source={require('../../../../assets/truck.json')} autoPlay loop />
          ) : (
            <Text style={{ color: '#fff', marginBottom: 12 }}>Cargando animacion...</Text>
          )}

          <DefaultTextInput
            icon={require('../../../../assets/email.png')}
            placeholder="Correo electronico"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            placeholderTextColor="gray"
            textColor='gray'
          />

          <DefaultTextInput
            icon={require('../../../../assets/password.png')}
            placeholder="Contraseña"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            placeholderTextColor="gray"
            textColor='gray'
          />

          <DefaultRoundedButton
            text="INICIAR SESION"
            onPress={() => {
              handleLogin();
            }}
            backgroundColor="orange"
          />

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>{isGoogleBusy ? 'Conectando...' : 'Continuar con Google'}</Text>
          </TouchableOpacity>

        </View>}
      </Shadow>

      <Modal visible={linkToken !== null} transparent animationType="fade" onRequestClose={() => setLinkToken(null)}>
        <View style={styles.linkOverlay}>
          <View style={styles.linkCard}>
            <Text style={styles.linkTitle}>Vincular tu cuenta de Google</Text>
            <Text style={styles.linkText}>
              Ya tienes una cuenta con este correo. Escribe tu contraseña una sola vez para vincular Google; después podrás entrar de las dos formas.
            </Text>
            <TextInput
              style={styles.linkInput}
              value={linkPassword}
              onChangeText={setLinkPassword}
              secureTextEntry
              placeholder="Contraseña de tu cuenta"
              placeholderTextColor="#999"
            />
            <DefaultRoundedButton text={isGoogleBusy ? 'Vinculando...' : 'Vincular'} backgroundColor="orange" onPress={handleLinkGoogle} marginTop={14} height={50} />
            <TouchableOpacity style={{ alignSelf: 'center', padding: 12 }} onPress={() => { setLinkToken(null); setLinkPassword(''); }}>
              <Text style={{ color: '#555', fontWeight: 'bold' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'center', paddingBottom: 4 }} onPress={() => { setLinkToken(null); navigation.navigate('ForgotPasswordScreen', { email }); }}>
              <Text style={{ color: '#555' }}>No recuerdo mi contraseña</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.forgotLink} onPress={() => navigation.navigate('ForgotPasswordScreen', { email })}>
        <Text style={styles.textForgot}>¿Olvidaste tu Contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.containerDivider}>
        <View style={styles.divider} />
        <Text style={styles.textDontHaveAccount}>O</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.containerTextDontHaveAccount}>
        <Text style={styles.textDontHaveAccount}>¿No tienes cuenta?</Text>
        <TouchableOpacity onPress ={() => navigation.navigate('RegisterScreen')}>
            <Text style={styles.textRegister}>Registrate</Text>
        </TouchableOpacity>
        
      </View>

    </View>
  )
}

