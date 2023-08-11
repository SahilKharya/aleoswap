import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Mint from "./components/Mint";
import Create from "./components/Create";
import Home from "./components/Home";
import { Route, Routes } from "react-router-dom";
import {
  useAccount,
  useConnect,
  useExecuteProgram,
  PuzzleWalletProvider,
} from '@puzzlehq/sdk';
import { PuzzleWeb3Modal } from '@puzzlehq/sdk';
import Activity from "./components/Activity";

function App() {
  const { connect } = useConnect();
  const { account, accounts, isConnected } = useAccount();
  const {
    execute,
    loading,
    transactionId,
    outputPrivate,
    outputRecords,
    outputPublic,
    outputConstant,
    error,
  } = useExecuteProgram({
    programId: "leoswapxyz_v2.aleo",
    functionName: 'create_token',
    // Aleo program inputs need their types specified, our program takes in 32 bit integers
    // so the inputs should look like "2i32 3i32"
    inputs: "11u64 " + "8u8 " + "20u64",
  });

  return (
    <>
      <PuzzleWalletProvider>
        <div className="App">
          <Header connect={connect} isConnected={isConnected} address={account} />

          <div className="mainWindow">

            <Routes>
              <Route path='/' element={<Home isConnected={isConnected} connect={connect} />} />
              <Route path='/swap' element={<Swap isConnected={isConnected} address={account}/>} />
              <Route path='/mint' element={<Mint />} />
              <Route path='/create' element={<Create />} />
              <Route path='/activity' element={<Activity />} />
            </Routes>
          </div>
          {/* <div>
            <button
              onClick={() => execute()}
              disabled={loading}
            >
              execute program
            </button>
            {error && <p>error executing program: {error}</p>}
            {loading && <p>executing program...</p>}
            {transactionId && !loading && !error && <p>Transaction Id: {transactionId}</p>}
            {outputPrivate && (
              <p>{"Result:" + outputPrivate.replace("i32", "")}</p>
            )}
          </div> */}
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
