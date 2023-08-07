import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { BrowserRouter } from 'react-router-dom';
import { PuzzleWalletProvider } from '@puzzlehq/sdk';
import "./index.css";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <React.StrictMode>
    <PuzzleWalletProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PuzzleWalletProvider>
  </React.StrictMode>
);
