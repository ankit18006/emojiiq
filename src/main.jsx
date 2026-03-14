import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const initCapacitor = async () => {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#080818' });
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (e) { /* browser mein ignore */ }
};
initCapacitor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
