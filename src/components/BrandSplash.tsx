import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

export function BrandSplash({ onReady }: { onReady?: () => void }) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.wrap, { width, height }]} onLayout={onReady}>
      <StatusBar style="dark" />
      <Image
        source={require('../../assets/splash.png')}
        style={{ width, height }}
        resizeMode="contain"
        onLoad={onReady}
        accessibilityLabel="Ovella. Track, plan, grow."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
