import React from 'react';
import { AppProvider } from './context/AppContext';
import PopupView from './components/PopupView';

function App() {
  return (
    <AppProvider>
      <div className="w-full min-h-screen bg-gray-50">
        <PopupView />
      </div>
    </AppProvider>
  );
}

export default App;

