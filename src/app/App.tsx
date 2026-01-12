import React from 'react';
import { AppProvider } from '../context/AppContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import MainView from '../components/layout/MainView';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <MainView />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

