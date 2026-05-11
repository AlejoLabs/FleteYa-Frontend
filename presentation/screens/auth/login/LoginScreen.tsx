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

interface Props extends StackScreenProps<RootStackParamList, 'LoginScreen'> { };
export default function LoginScreen({ navigation, route }: Props) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


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
      console.log('Response', 'Login exitoso');
    }
    console.log('Login response', response);
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

        </View>}
      </Shadow>

      <Text style={styles.textLogin}>¿Olvidaste tu Contraseña?</Text>

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

