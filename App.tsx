import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { MainStackNavigator } from './presentation/navigator/MainStackNavigator';
import { ToastProvider } from './presentation/components/ui';
import { fontAssets } from './presentation/theme';

export default function App() {
  // Si las fuentes no cargan, la app sigue con las del sistema en vez de quedarse en blanco
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      {/* Íconos oscuros de base; el login los cambia a claros mientras está abierto */}
      <StatusBar style="dark" />
      <ToastProvider>
        <NavigationContainer>
          <MainStackNavigator />
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
