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
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[RootLayout] Iniciando pre-carga de activos...');

        // 1. Cargar fuentes con alias duales para mayor compatibilidad en Web/Native
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

        // Esperar a que todo lo técnico esté descargado
        await Promise.all([fontPromise, ...cacheImages]);

        // Renderiza el componente de font primer ahora que el archivo está en memoria
        setFontsLoaded(true);
        console.log('[RootLayout] Activos descargados. Esperando activación de fuentes en el DOM...');

        // 3. BÚFER DE SEGURIDAD EXCLUSIVO PARA WEB: 
        // Mientras setAppIsReady es false, el DOM de Web solo tendrá el custom web splash
        // y el font primer. El navegador usará este tiempo para pintar la fuente.
        const delay = Platform.OS === 'web' ? 1500 : 800;
        await new Promise(resolve => setTimeout(resolve, delay));

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
      // Ocultar la splash screen ahora que el root view está listo
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 100);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    // EN WEB: Esto actúa como la Splash Screen mientras el navegador procesa la fuente.
    // EN NATIVO: Esto queda oculto detrás de la Splash Screen nativa.
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        {fontsLoaded && (
          <RNText style={styles.fontPrimer}>
            {/* Un caracter común de MaterialCommunityIcons para forzar la carga del glifo */}
            &#xF0A4;
          </RNText>
        )}
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={onLayoutRootView}
    >
      <PaperProvider theme={theme}>
        <ThemeProvider value={AdaptedDefaultTheme}>
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
  // Estilo para el priming de fuente
  // No usamos opacity: 0 ni lo sacamos de la pantalla para evitar
  // que el navegador optimice y se salte la carga real de la fuente
  fontPrimer: {
    position: 'absolute',
    color: 'transparent',
    fontSize: 10,
    fontFamily: 'MaterialCommunityIcons',
  },
});
