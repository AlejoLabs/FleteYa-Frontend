import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { MainStackNavigator } from './presentation/navigator/MainStackNavigator';
import { ToastProvider } from './presentation/components/ui';
import { fontAssets } from './presentation/theme';
import { navigationRef } from './presentation/navigator/navigationRef';
import PhotoSourceSheet from './presentation/components/PhotoSourceSheet';
import { loadSavedLanguage } from './i18n';

export default function App() {
  // Si las fuentes no cargan, la app sigue con las del sistema en vez de quedarse en blanco
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  // El idioma que la persona eligió en este teléfono se carga antes de dibujar, para no mostrar un idioma y cambiarlo
  const [languageReady, setLanguageReady] = useState(false);
  useEffect(() => {
    loadSavedLanguage().finally(() => setLanguageReady(true));
  }, []);
  if ((!fontsLoaded && !fontError) || !languageReady) return null;

  return (
    <SafeAreaProvider>
      {/* Íconos oscuros de base; el login los cambia a claros mientras está abierto */}
      <StatusBar style="dark" />
      <ToastProvider>
        <NavigationContainer ref={navigationRef}>
          <MainStackNavigator />
        </NavigationContainer>
        <PhotoSourceSheet />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
