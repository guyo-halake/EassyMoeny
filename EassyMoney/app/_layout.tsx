import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'onboarding',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const deviceColorScheme = useColorScheme();
  const [themePref, setThemePref] = useState<'light' | 'dark' | 'system'>(deviceColorScheme === 'dark' ? 'dark' : 'light');
  const [initialRoute, setInitialRoute] = useState<'onboarding' | 'login' | '(tabs)'>('onboarding');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const userPin = await AsyncStorage.getItem('userPin');
        const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system') {
          setThemePref(savedTheme as 'dark' | 'light' | 'system');
        }

        if (userPin && isAuthenticated === 'true') {
          setInitialRoute('(tabs)');
        } else if (userPin && isAuthenticated !== 'true') {
          setInitialRoute('login');
        } else {
          setInitialRoute('onboarding');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setInitialRoute('onboarding');
      } finally {
        setIsReady(true);
      }
    };

    checkAuthState();
  }, []);

  if (!isReady) {
    return null;
  }

  const effectiveColorScheme = themePref === 'system' ? deviceColorScheme : themePref;

  return (
    <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="setup-pin" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
