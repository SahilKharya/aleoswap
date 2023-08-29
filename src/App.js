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
} from '@puzzlehq/sdk';
import Activity from "./components/Activity";

function App() {
  const { connect } = useConnect();
  const { account, isConnected } = useAccount();

  return (
    <>
      <div className="App">
        <Header connect={connect} isConnected={isConnected} address={account} />
        <div className="mainWindow">
          <Routes>
            <Route path='/' element={<Home isConnected={isConnected} connect={connect} />} />
            <Route path='/swap' element={<Swap isConnected={isConnected} address={account} />} />
            <Route path='/mint' element={<Mint />} />
            <Route path='/create' element={<Create />} />
            <Route path='/activity' element={<Activity />} />
          </Routes>
        </div>
      </div>

    </>
  );
}

export default App;
