import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text as RNText } from 'react-native';
import 'react-native-reanimated';
import { MD3LightTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Bloquear el ocultamiento automático de la Splash Screen
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

const { LightTheme: AdaptedDefaultTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3b82f6',
    secondary: '#1e293b',
    tertiary: '#94a3b8',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[RootLayout] Iniciando pre-carga de activos...');

        // 1. Cargar fuentes
        const fontPromise = Font.loadAsync({
          'MaterialCommunityIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
          ...MaterialCommunityIcons.font,
        });

        // 2. Pre-cargar el logo y otros assets críticos
        const imageAssets = [
          require('../assets/images/logo.png'),
          require('../assets/images/splash-icon.png'),
        ];

        const cacheImages = imageAssets.map(image => Asset.fromModule(image).downloadAsync());

        // Esperar a que todo lo técnico esté descargado por Expo
        await Promise.all([fontPromise, ...cacheImages]);
        console.log('[RootLayout] Activos descargados. Forzando compilación de fuentes a nivel nativo...');

        // 3. EXPLÍCITO PARA WEB (CSSOM LOADING):
        // En los navegadores modernos, la fuente no se rinde hasta que se asigna
        // a un nodo. Para saltarnos el "cuadrito", obligamos a la API document.fonts
        // a descargarla y alocarla en memoria para el layout de vectores clave.
        if (Platform.OS === 'web') {
          try {
            // "\uF013" y otros son unicodes comúnmente parseados y forzamos su carga 
            await document.fonts.load('24px MaterialCommunityIcons');
          } catch (e) {
            console.warn("document.fonts no soportado en este navegador", e);
          }
          await new Promise(resolve => setTimeout(resolve, 300)); // Pequeña latencia post-API
        } else {
          // Buffer de seguridad clásico en Native (Android/iOS)
          await new Promise(resolve => setTimeout(resolve, 800));
        }

      } catch (e) {
        console.warn('Error durante la pre-carga:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log('[RootLayout] Layout listo. Ocultando Splash Screen Nativa.');
      // Ocultar la splash screen ahora que el root view está pintado
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 100);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    // Al devolver null, mantenemos activo el DOM css overlay original de Expo Router en Web.
    return null;
  }

  return (
    <View
      style={styles.container}
      onLayout={onLayoutRootView}
    >
      <PaperProvider theme={theme}>
        <ThemeProvider value={AdaptedDefaultTheme as any}>
          <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f172a' }
          }}>
            <Stack.Screen name="login" options={{ title: 'Iniciar Sesión' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </PaperProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
