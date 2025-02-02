import React from 'react';
import { PageProvider } from './context/PageContext';
import Page from './components/Page';

export default function App() {
  return (
    <PageProvider>
      <Page />
    </PageProvider>
  );
}