import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SettingsProvider } from './settings.jsx';
import { PortfolioProvider } from './portfolio.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <PortfolioProvider>
          <App />
        </PortfolioProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
