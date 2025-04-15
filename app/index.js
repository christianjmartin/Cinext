import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PageProvider } from './context/PageContext';
import Page from './components/Page';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync(); // 👈 hold splash until we're ready

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      // Simulate loading (or await fonts, data, etc.)
      await new Promise(resolve => setTimeout(resolve, 100)); // Tiny delay to let context settle
      setAppReady(true);
    };

    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync(); // 👈 hide only when ready
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <PageProvider>
      <NavigationContainer onReady={onLayoutRootView}>
        <Page />
      </NavigationContainer>
    </PageProvider>
  );
}
