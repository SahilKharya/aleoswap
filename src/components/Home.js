import React from 'react'
import { motion } from 'framer-motion';
import Logo from '../asset/LargeLogo.png';
import Globe from '../asset/globe.svg';
import Text from '../asset/text.svg';
import { Link } from "react-router-dom";

function Home(props) {

  const { isConnected, connect } = props;

  return (
    <>
      <div className="container">
        {isConnected && (
          <>
            <img src={Logo} alt="logo" className="largeLogo" />
            <br></br>
            <Link to="/swap" className="link">
              <div className="connectButton m-space">Swap</div>
            </Link>
          </>


        )}

        {!isConnected && (
          <>
            <img src={Globe} alt="logo" />
            <div className="m-space">
              <p className='logoText'>LeoSwap</p>
              Secure Decentralized Exchange running on Aleo
              <br></br>
              <br></br>
              Come take a look
            </div>
            <span className='in-flex'>
              <motion.div
                className="connectButton m-space"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                onClick={connect}
              >
                Connect Wallet

              </motion.div>
              <Link to="/swap" className="link">
                <motion.div
                  className="connectButton m-space btn-later"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  Connect Later

                </motion.div>
              </Link>
            </span>
          </>
        )}
      </div>
    </>

  )
}

export default Home