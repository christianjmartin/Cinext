import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PageProvider } from './context/PageContext';
import Page from './components/Page';

export default function App() {
  return (
    <PageProvider>
      <NavigationContainer>
        <Page />
      </NavigationContainer>
    </PageProvider>
  );
}
