import React from 'react'
import { motion } from 'framer-motion';
import Globe from '../asset/globe.svg';
import Text from '../asset/text.svg';

function Home(props) {

  const { isConnected, connect } = props;

  return (
    <>
      <div className="container">
        <motion.img
          className="m-space"
          src={Globe}
          alt="globe_logo"
          initial={{ scale: 1, rotate: 0 }}
          animate={{ scale: 2.2, rotate: 182 }}
          transition={{ duration: 2 }}
        />
        <motion.img
          className="m-space"
          src={Text}
          alt="leo-swap"
          initial={{ opacity: 0.5, y: 10,x: 10, scale: 0.2 }}
          animate={{ opacity: 1, y: -148, x:10, scale: 0.71 }}
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