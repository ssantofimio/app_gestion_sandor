import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
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
  const [fontsLoaded] = Font.useFonts({
    MaterialCommunityIcons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
    ...MaterialCommunityIcons.font,
  });

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadAssets() {
      try {
        console.log('[RootLayout] Iniciando pre-carga de activos ULTRA RÁPIDA...');
        const imageAssets = [
          require('../assets/images/logo.png'),
          require('../assets/images/splash-icon.png'),
        ];
        await Promise.all(
          imageAssets.map(image => Asset.fromModule(image).downloadAsync())
        );
      } catch (e) {
        console.warn('Error durante la pre-carga:', e);
      } finally {
        setImagesLoaded(true);
      }
    }

    loadAssets();
  }, []);

  const isReady = fontsLoaded && imagesLoaded;

  // Animación suave de Fade-In para enmascarar cualquier FOUC restante velozmente
  useEffect(() => {
    if (isReady) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        // En Web, 400ms es el "Sweet Spot" para disfrazar la renderización de la fuente 
        // y a la vez sentirse como una App increíblemente rápida y fluida
        duration: Platform.OS === 'web' ? 400 : 300,
        useNativeDriver: Platform.OS !== 'web', // En web dependemos de CSS polyfill
      }).start();
    }
  }, [isReady, fadeAnim]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      console.log('[RootLayout] Layout listo. Ocultando Splash Screen Nativa.');
      // Ahora NO HAY setTimeout limitador. Ocultamos instantáneamente.
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null; // El Custom Splash en Web y el nativo en iOS/Android siguen activos
  }

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
