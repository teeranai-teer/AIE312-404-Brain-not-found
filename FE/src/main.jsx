import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { PortfolioProvider } from './portfolio.jsx';
import './story/story.css';

// PortfolioProvider โหลด GET /api/portfolio ครั้งเดียว แล้วแชร์ให้แฟ้มประวัติ (Dossier) ใช้
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </React.StrictMode>
);
