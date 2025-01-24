import React from 'react';
import { PageProvider } from './context/PageContext';  // Import PageProvider
import Page from './components/Page';

export default function App() {
  return (
    <PageProvider>
      <Page />
    </PageProvider>
  );
}