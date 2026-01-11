import React from 'react';

export default function ViewDetailsButton() {
  const openSidePanel = async () => {
    try {
      // Get current window
      const window = await chrome.windows.getCurrent();
      if (window?.id !== undefined) {
        // Open side panel
        await chrome.sidePanel.open({ windowId: window.id });
      } else {
        // Fallback: send message to background
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      }
    } catch (error) {
      console.error('Failed to open side panel:', error);
      // Fallback: try alternative method
      try {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      } catch (e) {
        console.error('Alternative method also failed:', e);
      }
    }
  };

  return (
    <button
      onClick={openSidePanel}
      className="btn-primary w-full mt-4"
      aria-label="View detailed analysis in side panel"
    >
      View Detailed Analysis
    </button>
  );
}

