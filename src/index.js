import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { BrowserRouter } from 'react-router-dom';
import { PuzzleWalletProvider } from '@puzzlehq/sdk';
import { PuzzleWeb3Modal } from '@puzzlehq/sdk';
import "./index.css";

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
    <PuzzleWeb3Modal
      dAppName='Puzzle Starter app'
      dAppDescription="Let's Puzzle!"
      dAppUrl='http://localhost:5173'
      dAppIconURL='https://walletconnect.puzzle.online/assets/logo_white-b85ba17c.png'
    />
  </React.StrictMode>
);
