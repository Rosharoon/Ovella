import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts as useNunito,
} from '@expo-google-fonts/nunito';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_600SemiBold_Italic,
  useFonts as usePlayfair,
} from '@expo-google-fonts/playfair-display';
import { StatusBar } from 'expo-status-bar';
import './src/firebase';
import './src/utils/reminders';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandSplash } from './src/components/BrandSplash';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AppGate({ fontsReady }: { fontsReady: boolean }) {
  const { hydrated } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [splashPainted, setSplashPainted] = useState(false);

  useEffect(() => {
    if (!splashPainted) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [splashPainted]);

  useEffect(() => {
    if (!showSplash) return undefined;
    const fallback = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(fallback);
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash || !splashPainted || !fontsReady || !hydrated) return undefined;
    const hold = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(hold);
  }, [showSplash, splashPainted, fontsReady, hydrated]);

  if (showSplash) {
    return <BrandSplash onReady={() => setSplashPainted(true)} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [nunitoLoaded] = useNunito({
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });
  const [playfairLoaded] = usePlayfair({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_600SemiBold_Italic,
  });

  return (
    <View style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <AppGate fontsReady={nunitoLoaded && playfairLoaded} />
        </AppProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF5F7' },
});
