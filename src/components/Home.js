import React from 'react'
import { motion } from 'framer-motion';
import Globe from '../asset/globe.svg';
import Text from '../asset/text.svg';
import { Route, Routes, useLocation } from "react-router-dom";
import {
  useAccount,
  useConnect,
  useExecuteProgram,
  PuzzleWalletProvider,
} from '@puzzlehq/sdk';
import { PuzzleWeb3Modal } from '@puzzlehq/sdk';


function Home(props) {

  console.log(props)
  const { isConnected, connect } = props;

  console.log(isConnected)
  return (
    <>
      <div className="container">
        <motion.img
          className="m-space"
          src={Globe}
          alt="globe_logo"
          initial={{ scale: 1, rotate: 0 }}
          animate={{ scale: 2.2, rotate: 180 }}
          transition={{ duration: 2 }}
        />
        <motion.img
          className="m-space"
          src={Text}
          alt="leo-swap"
          initial={{ opacity: 0.5, y: 10, scale: 0.2 }}
          animate={{ opacity: 1, y: -130, scale: 0.7 }}
          transition={{ duration: 2 }}
        >
        </motion.img>
        <motion.div
          className="m-space"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          Secure Decentralized Exchange running on Aleo
          <br></br>
          <br></br>
          Come take a look
        </motion.div>
        {!isConnected && (<motion.div
          className="connectButton m-space"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          onClick={connect}
        >
          Connect Wallet 

        </motion.div>
        )}
      </div>
    </>

  )
}

export default Home