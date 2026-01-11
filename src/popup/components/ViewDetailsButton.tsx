import React from 'react';

export default function ViewDetailsButton() {
  const openSidePanel = async () => {
    try {
      // Open side panel
      await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
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

