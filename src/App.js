import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Home from "./components/Home";
import { Route, Routes, useLocation } from "react-router-dom";
import {
  useAccount,
  useConnect,
  useExecuteProgram,
  PuzzleWalletProvider,
} from '@puzzlehq/sdk';
import { PuzzleWeb3Modal } from '@puzzlehq/sdk';


function App() {
  const { connect } = useConnect();
  const { account, accounts, isConnected, session, error, loading } = useAccount();
  console.log(isConnected)

  return (
    <>
      <PuzzleWalletProvider>
        <div className="App">
          <Header connect={connect} isConnected={isConnected} address={account} />

          <div className="mainWindow">

            <Routes>
              <Route path='/' element={<Home isConnected={isConnected} connect={connect} />} />
              <Route path='/swap' element={<Swap />} />
            </Routes>
          </div>
        </div>
      </PuzzleWalletProvider>
      <PuzzleWeb3Modal
        dAppName='Puzzle Starter app'
        dAppDescription="Let's Puzzle!"
        dAppUrl='http://localhost:5173'
        dAppIconURL='https://walletconnect.puzzle.online/assets/logo_white-b85ba17c.png'
      />
    </>
  );
}

export default App;
