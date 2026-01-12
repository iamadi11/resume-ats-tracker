import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from '../../popup/context/AppContext';
import DrawerView from './DrawerView';
import './drawer.css';

interface DrawerAppProps {
  onClose?: () => void;
}

function DrawerApp({ onClose }: DrawerAppProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <AppProvider>
      <div className={`ats-drawer-container ${isMinimized ? 'minimized' : ''}`}>
        <DrawerView 
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
          onClose={onClose}
        />
      </div>
    </AppProvider>
  );
}

export function injectDrawer(container: HTMLElement) {
  const root = createRoot(container);
  root.render(<DrawerApp />);
  return root;
}

export default DrawerApp;

