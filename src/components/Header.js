import React from "react";
import Logo from "../asset/Small_Logo.png";
import { Link } from "react-router-dom";

function Header(props) {

  const { address, isConnected, connect } = props;
  return (
    <header>
      {isConnected && (
        <div className="leftH">
          <Link to="/">

            <img src={Logo} alt="logo" className="logo" />
          </Link>
          <Link to="/swap" className="link">
            <div className="headerItem">Swap</div>
          </Link>
          <Link to="/mint" className="link">
            <div className="headerItem">Mint</div>
          </Link>
        </div>
      )}
      <div className="rightH">
        {isConnected && (
          <div className="connectButton" onClick={connect}>

            <>
              <span className="circle"></span>
              {address.address.slice(0, 6) + "..." + address.address.slice(55)}
            </>
          </div>
        )}

      </div>
    </header>
  );
}

export default Header;
