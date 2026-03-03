import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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

        // 1. Cargar fuentes e iconos
        const fontPromise = Font.loadAsync({
          ...MaterialCommunityIcons.font,
        });

        // 2. Pre-cargar el logo y otros assets críticos
        const imageAssets = [
          require('../assets/images/logo.png'),
          require('../assets/images/splash-icon.png'),
        ];

        const cacheImages = imageAssets.map(image => {
          return Asset.fromModule(image).downloadAsync();
        });

        // Esperar a que todo lo técnico esté listo
        await Promise.all([fontPromise, ...cacheImages]);

        console.log('[RootLayout] Activos cargados. Esperando renderizado...');

        // 3. BÚFER DE SEGURIDAD: Esperar un poco más para asegurar que 
        // los glifos de la fuente se hayan registrado en el motor de renderizado.
        await new Promise(resolve => setTimeout(resolve, 800));

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
      console.log('[RootLayout] Layout listo. Ocultando Splash Screen.');
      // Ocultar la splash screen ahora que el root view está listo
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    // Mientras no esté listo, devolvemos null para que el sistema mantenga la Splash Screen
    return null;
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
    backgroundColor: '#0f172a', // Coincide con el color de login y app.json
  },
});
